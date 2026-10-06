type Props = {
  src?: string | null;
};

/** Passport-style frame on the membership application. Shows the chosen photo. */
export function MembershipApplicationPhotoFrame({ src }: Props) {
  return (
    <div
      className="mx-auto flex h-[150px] w-[120px] items-center justify-center overflow-hidden border border-black bg-[#fafafa]"
      role="img"
      aria-label={src ? "Your photo on the application form" : "Photo frame"}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- preview blob URL
        <img
          src={src}
          alt="Your photo on the membership form"
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold uppercase">Photo</span>
      )}
    </div>
  );
}
