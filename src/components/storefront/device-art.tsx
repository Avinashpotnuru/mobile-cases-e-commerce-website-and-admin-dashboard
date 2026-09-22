export function DeviceArt({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative mx-auto flex w-full items-center justify-center ${className ?? "h-40"}`}
    >
      <span className="absolute h-28 w-28 rounded-full bg-accent/15 blur-3xl transition-all duration-500 group-hover:bg-accent/25" />

      <div className="relative transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:-rotate-2 group-hover:scale-[1.03]">
        <div className="h-36 w-[4.6rem] rounded-[1.5rem] border border-accent/40 bg-gradient-to-b from-amber-100 via-amber-200/70 to-stone-200 p-1.5 shadow-[0_18px_30px_-16px_rgb(0_0_0/0.45)]">
          <div className="relative flex h-full w-full flex-col items-center overflow-hidden rounded-[1.2rem] border border-white/30 bg-gradient-to-b from-stone-800 to-stone-950 pt-3.5">
            <span className="h-1.5 w-7 rounded-full bg-white/15" />
            <span className="mt-3 h-1.5 w-12 rounded-full bg-amber-400/40" />
            <span className="mt-1.5 h-1.5 w-10 rounded-full bg-white/10" />
            <span className="mt-1.5 h-1.5 w-11 rounded-full bg-white/10" />
            <span className="mt-auto mb-2 rounded-full bg-amber-500 px-2.5 py-[3px] text-[8px] font-bold tracking-widest text-stone-950 uppercase">
              Armor
            </span>
            <span className="absolute -bottom-6 h-12 w-12 rounded-full bg-amber-500/30 blur-xl" />
          </div>
        </div>
      </div>

      <span className="absolute top-2 right-3 rounded-full border border-border bg-card px-2.5 py-1 text-[9px] font-bold tracking-wider text-accent uppercase shadow-sm">
        From &#8377;749
      </span>
      <span className="absolute bottom-3 left-1 translate-x-2 rounded-full border border-border bg-card px-2 py-0.5 text-[9px] font-semibold tracking-wider text-muted-foreground">
        4.7&Prime;
      </span>
    </div>
  );
}