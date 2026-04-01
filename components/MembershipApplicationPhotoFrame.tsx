/**
 * Decorative passport-style frame at the top of the membership application page.
 * Reminds applicants to prepare a facial photo (captured in section IX of the form).
 */
export function MembershipApplicationPhotoFrame() {
  return (
    <div className="flex max-w-[12rem] flex-col items-end">
      <p className="text-right text-xs font-bold uppercase tracking-[0.18em] text-slate-900">
        Take your photo
      </p>
      <div className="mt-3 flex flex-col items-end">
        <div
          className="rounded-sm border-2 border-slate-900 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:border-slate-900 dark:bg-white"
          role="img"
          aria-label="Placeholder frame for your passport-style facial photograph"
        >
          <div className="flex aspect-[3/4] w-[min(9rem,40vw)] items-center justify-center border border-dashed border-slate-400 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-100">
            <span className="px-2 text-center text-[9px] font-bold uppercase leading-relaxed tracking-wider text-slate-400">
              Your face
              <br />
              here
            </span>
          </div>
        </div>
      </div>
      <p className="mt-4 max-w-[12rem] text-right text-[11px] leading-relaxed text-slate-600 dark:text-slate-600">
        Section <strong className="font-semibold text-slate-800">IX</strong> — use{" "}
        <strong className="font-semibold text-slate-800">Take your picture</strong> or choose a file.
      </p>
    </div>
  );
}
