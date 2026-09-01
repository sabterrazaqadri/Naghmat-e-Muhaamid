import { Khatim } from "@/components/Ornament";
import { site } from "@/lib/site";

/**
 * Formal colophon closing a kalam.
 *
 * Every poem in this diwan is by one poet, so attribution is a property of the
 * collection, not of the row — repeating a name on each poem would imply an
 * anthology and invite the two from disagreeing. Placing the credit *after*
 * the verse, set apart by a rule and an ornament, follows how a printed diwan
 * closes a piece: the poem is read first, the hand behind it named second.
 */
export function PoetCredit() {
  return (
    <footer className="mt-10 flex flex-col items-center text-center">
      <div
        aria-hidden="true"
        className="flex w-full max-w-sm items-center gap-4 text-gold"
      >
        <span className="rule-fade flex-1" />
        <Khatim size={14} className="shrink-0 opacity-80" />
        <span className="rule-fade flex-1" />
      </div>

      <p className="body-ur mt-4 text-[0.7rem] tracking-[0.22em] text-muted">
        کلام
      </p>
      <p className="heading-ur text-lg text-foreground">{site.poet.nameUr}</p>
      <p className="body-ur text-xs leading-7 text-muted">
        {site.poet.titlesUr}
      </p>
    </footer>
  );
}
