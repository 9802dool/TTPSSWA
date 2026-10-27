import { describe, expect, it } from "vitest";
import parse from "node-html-parser";
import { addHeadingIdsAndTocLinks, getRuleBookHtml } from "../lib/rule-book-html";
import { readFileSync } from "node:fs";

function linkMap(html: string) {
  const root = parse(html, { lowerCaseTagName: true });
  const links = root.querySelectorAll("a.rule-book-toc-link");
  return links.map((link) => {
    const href = link.getAttribute("href") || "";
    const id = href.startsWith("#") ? href.slice(1) : "";
    const target = id ? root.getElementById(id) : null;
    return {
      text: link.text.replace(/\s+/g, " ").trim(),
      href,
      id,
      targetText: target ? target.text.replace(/\s+/g, " ").trim() : "",
      targetClass: target?.getAttribute("class") || "",
    };
  });
}

describe("rule book chapter links", () => {
  it("links tricky chapter titles, joined wrap lines, and an unstyled chapter", () => {
    const html = addHeadingIdsAndTocLinks(`
      <p><strong>TABLE OF CONTENTS</strong></p>
      <ol>
        <li>Modes of Meetings ………………………… 5</li>
        <li>(a) Disciplinary Committee ………………………… 6</li>
      </ol>
      <p>(b) Disciplinary Committee ………………………… 6</p>
      <ol>
        <li>Membership ………………………… 4</li>
        <li>Obligations of Membership ………………………… 4</li>
        <li>Power of the Executive Committee ………………………… 10</li>
      </ol>
      <p>Code of Offences for Meeting of the General Council and all other</p>
      <p>Committees of the Association ………………………… 16</p>
      <ol>
        <li>Inspection of Books ………………………… 27</li>
      </ol>
      <h2>6. MODE OF MEETINGS</h2>
      <h2>7. (a) DISCIPLINARY COMMITTEE</h2>
      <h2>7.(b) DISCIPLINARY TRIBUNAL</h2>
      <h2>MEMBERSHIP</h2>
      <h2>4. OBLIGATIONS OF MEMBERSHIP</h2>
      <h1>11. POWERS OF THE EXECUTIVE COMMITTEE</h1>
      <h1>16. CODE OF CONDUCT AND OFFENCES FOR MEETINGS OF THE GENERAL COUNCIL AND ALL OTHER COMMITTEES OF THE ASSOCIATION.</h1>
      <p><strong>22. INSPECTION OF THE BOOKS</strong></p>
    `);

    const links = linkMap(html);
    expect(links).toHaveLength(8);
    expect(links.every((link) => link.href.startsWith("#") && link.targetText)).toBe(true);
    expect(links.every((link) => link.targetClass.includes("rule-book-anchor"))).toBe(true);

    const byText = (snippet: string) => links.find((link) => link.text.includes(snippet));

    expect(byText("Modes of Meetings")?.targetText).toMatch(/MODE OF MEETINGS/);
    expect(byText("(a) Disciplinary Committee")?.targetText).toMatch(/DISCIPLINARY COMMITTEE/);
    expect(byText("(b) Disciplinary Committee")?.targetText).toMatch(/DISCIPLINARY TRIBUNAL/);
    expect(byText("Obligations of Membership")?.targetText).toMatch(/OBLIGATIONS OF MEMBERSHIP/);
    expect(byText("Obligations of Membership")?.targetText).not.toBe("MEMBERSHIP");
    const membership = links.find((link) => /^Membership\b/.test(link.text));
    expect(membership?.targetText).toBe("MEMBERSHIP");
    expect(byText("Power of the Executive")?.targetText).toMatch(/POWERS OF THE EXECUTIVE/);
    expect(byText("Code of Offences")?.text).toMatch(/Committees of the Association/);
    expect(byText("Code of Offences")?.targetText).toMatch(/CODE OF CONDUCT AND OFFENCES/);
    expect(byText("Inspection of Books")?.targetText).toMatch(/INSPECTION OF THE BOOKS/);

    const ids = links.map((link) => link.id);
    expect(new Set(ids).size).toBe(ids.length);

    const root = parse(html, { lowerCaseTagName: true });
    const starts = root.querySelectorAll("ol").map((ol) => ol.getAttribute("start"));
    expect(starts[0]).toBe("1");
    expect(Number(starts[1])).toBeGreaterThan(1);
  });

  it("links every chapter in the official rule book", async () => {
    const { html, error } = await getRuleBookHtml();
    expect(error).toBeUndefined();
    const links = linkMap(html);
    const unmatched = links.filter((link) => !link.targetText || !link.targetClass.includes("rule-book-anchor"));
    expect(unmatched, JSON.stringify(unmatched, null, 2)).toEqual([]);

    const expectTarget = (snippet: string, heading: RegExp) => {
      const link = links.find((item) => item.text.includes(snippet));
      expect(link, snippet).toBeTruthy();
      expect(link?.targetText, `${snippet} -> ${link?.targetText}`).toMatch(heading);
    };

    expectTarget("Ordinance Chapter 31", /COMPANIES ORDINANCE/);
    expectTarget("Articles of Association of the Trinidad and Tobago Police Service", /ARTICLES OF ASSOCIATION/);
    expectTarget("Social and Welfare Association", /ARTICLES OF ASSOCIATION/);
    expectTarget("Modes of Meetings", /MODE OF MEETINGS/);
    expectTarget("(b) Disciplinary Committee", /DISCIPLINARY TRIBUNAL/);
    expectTarget("Obligations of Membership", /OBLIGATIONS OF MEMBERSHIP/);
    expectTarget("Power of the Executive Committee", /POWERS OF THE EXECUTIVE/);
    expectTarget("Code of Offences", /CODE OF CONDUCT AND OFFENCES/);
    expectTarget("Inspection of Books", /INSPECTION OF THE BOOKS/);
    expectTarget("Central Committee Standing Orders", /CENTRAL COMMITTEE STANDING ORDERS/);
    expectTarget("GLOSSARY", /GLOSSARY/);

    const membership = links.find((link) => /^Membership\b/.test(link.text));
    expect(membership?.targetText).toMatch(/^MEMBERSHIP\b/);

    const articles = links.find((link) => link.text.includes("Articles of Association"));
    expect(articles?.text).toMatch(/Social and Welfare Association/);
    const central = links.find((link) => link.text.includes("Central Committee Standing Orders"));
    expect(central?.text).toMatch(/Trinidad and Tobago Police Service Social and Welfare Association/);
    expect(central?.id).not.toBe(articles?.id);

    expect(links).toHaveLength(32);
    const ids = links.map((link) => link.id);
    expect(new Set(ids).size).toBe(ids.length);

    const root = parse(html, { lowerCaseTagName: true });
    const tocLists = root.querySelectorAll("ol").filter((ol) => ol.querySelector("a.rule-book-toc-link"));
    const starts = tocLists.map((ol) => Number(ol.getAttribute("start")));
    expect(starts[0]).toBe(1);
    for (let i = 1; i < starts.length; i += 1) {
      expect(starts[i]).toBeGreaterThan(starts[i - 1]);
    }
  });

  it("keeps smooth scrolling and header clearance in CSS", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toMatch(/scroll-behavior:\s*smooth/);
    expect(css).toMatch(/scroll-margin-top:\s*calc\(var\(--site-header-stack\)/);
    expect(css).toMatch(/@media \(max-width: 639px\)/);
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    const page = readFileSync("app/rule-book/page.tsx", "utf8");
    expect(page).not.toMatch(/scroll-mt-24/);
  });
});
