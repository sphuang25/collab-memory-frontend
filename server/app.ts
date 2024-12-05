import ArchivingConcept from "./concepts/archiving";
import AuthenticatingConcept from "./concepts/authenticating";
import FamilyingConcept from "./concepts/familying";
import FriendingConcept from "./concepts/friending";
import PostingConcept from "./concepts/posting";
import ProfilingConcept from "./concepts/profiling";
import SessioningConcept from "./concepts/sessioning";
import ThreadingConcept from "./concepts/threading";

// The app is a composition of concepts instantiated here
// and synchronized together in `routes.ts`.
export const Sessioning = new SessioningConcept();
export const Authing = new AuthenticatingConcept("users");
export const Posting = new PostingConcept("posts");
export const Friending = new FriendingConcept("friends");
export const Profiling = new ProfilingConcept("profiles");
export const Threading = new ThreadingConcept("threads_in_family");
export const Familying = new FamilyingConcept("families");
export const Archiving = new ArchivingConcept("archives");
