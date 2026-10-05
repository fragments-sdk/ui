/**
 * The library's words, kept in one place: `vocabulary.json`, typed here.
 *
 * `PROP_VOCABULARY` is the ruled value set for the shared prop axes (UIR-D31): `variant` is chrome
 * only, `tone` is colour, `size` is control height, `gap` is spacing, `status` is lifecycle.
 * `src/contract-vocabulary.test.ts` holds all component metadata to it.
 *
 * `BANNED_COPY_WORDS` are words the library's shipped strings never use: the library says
 * "check". The source lint rule `fui/conventions/banned-word` reads the same list from the JSON
 * file with plain Node; `eslint/banned-word.test.ts` holds the two to each other.
 *
 * Neither file ships: both are read by tests and the lint lane only.
 */
import vocabulary from "./vocabulary.json";

type PropAxis = "variant" | "tone" | "size" | "gap" | "status";

export const PROP_VOCABULARY: Readonly<Record<PropAxis, readonly string[]>> =
  vocabulary.propVocabulary;

export const BANNED_COPY_WORDS: readonly string[] = vocabulary.bannedCopyWords;
