/**
 * Decorative passport-style frame beside the membership application form.
 */
export function MembershipApplicationPhotoFrame() {
  return (
    <div className="flex w-full flex-col items-center">
      <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-900">
        Take your photo
      </p>
      <div className="mt-3 w-full">
        <div
          className="mx-auto w-fit rounded-sm border-2 border-slate-900 bg-white p-2 shadow-[0_2px_8px_rgba(15,23,42,0.08)] dark:border-slate-900 dark:bg-white"
          role="img"
          aria-label="Placeholder frame for your passport-style facial photograph"
        >
          <div className="flex aspect-[3/4] w-[min(9rem,100%)] items-center justify-center border border-dashed border-slate-400 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-50 dark:to-slate-100">
            <span className="px-2 text-center text-[9px] font-bold uppercase leading-relaxed tracking-wider text-slate-400">
              Your face
              <br />
              here
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
