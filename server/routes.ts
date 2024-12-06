import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Archiving, Authing, Familying, Posting, Profiling, Sessioning, Threading } from "./app";
import { PostDoc, PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Profiling question and options
  //public readonly profilingQuestion = "What are your goals in Fam.ly?";
  //private readonly profilingOptions = ["Learn family history", "Connect more often", "Learn others' interests", "Learn about identity"];

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
  }

  @Router.get("/users/user/:userID")
  async getUserByUserID(userID: ObjectId) {
    const userIDObject = new ObjectId(userID);
    const user = await Authing.getUserById(userIDObject);
    return user;
  }

  @Router.get("/users/id/:username")
  async getUserIDByUsername(username: string) {
    const user = await Authing.getUserByUsername(username);
    return user._id;
  }

  @Router.get("/users")
  async getUsers() {
    return await Authing.getUsers();
  }

  @Router.get("/users/:username")
  @Router.validate(z.object({ username: z.string().min(1) }))
  async getUser(username: string) {
    return await Authing.getUserByUsername(username);
  }

  @Router.post("/users")
  async createUser(session: SessionDoc, username: string, password: string) {
    Sessioning.isLoggedOut(session);
    return await Authing.create(username, password);
  }

  @Router.patch("/users/username")
  async updateUsername(session: SessionDoc, username: string) {
    const user = Sessioning.getUser(session);
    return await Authing.updateUsername(user, username);
  }

  @Router.patch("/users/password")
  async updatePassword(session: SessionDoc, currentPassword: string, newPassword: string) {
    const user = Sessioning.getUser(session);
    return Authing.updatePassword(user, currentPassword, newPassword);
  }

  @Router.delete("/users")
  async deleteUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    Sessioning.end(session);
    return await Authing.delete(user);
  }

  @Router.post("/login")
  async logIn(session: SessionDoc, username: string, password: string) {
    const u = await Authing.authenticate(username, password);
    Sessioning.start(session, u._id);
    return { msg: "Logged in!" };
  }

  @Router.post("/logout")
  async logOut(session: SessionDoc) {
    Sessioning.end(session);
    return { msg: "Logged out!" };
  }

  /**
   * Profile Routes
   */
  @Router.post("/profiles")
  async createProfile(session: SessionDoc, question: string, selectedChoices: string[]) {
    const user = Sessioning.getUser(session);
    const created = await Profiling.createProfile(user, question, selectedChoices);
    return { msg: created.msg, profile: await Responses.profile(created.profile) };
  }

  @Router.patch("/profiles")
  async updateProfile(session: SessionDoc, newChoices: string[]) {
    const user = Sessioning.getUser(session);
    const update = await Profiling.updateProfile(user, newChoices);
    return { msg: update.msg };
  }

  @Router.get("/profiles")
  async getProfileResponses(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const responses = await Profiling.getUserResponses(user);
    return responses;
  }

  @Router.get("/profiles/user")
  async getUserProfile(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const profile = await Profiling.getUserProfile(user);
    if (profile) {
      return profile;
    }
  }

  /*
  @Router.validate(
    z.object({
      selectedChoices: z.array(z.string()),
    }),
  )
  async updateProfile(session: SessionDoc, selectedChoices: string[]) {
    const userId = Sessioning.getUser(session);

    // Validate provided profiling choices
    const invalidChoices = selectedChoices.filter((choice) => !this.profilingOptions.includes(choice));
    if (invalidChoices.length > 0) {
      throw new Error(`Invalid choices: ${invalidChoices.join(", ")}`);
    }

    // Update the profile for the specific question
    await Profiling.updateProfile(userId, this.profilingQuestion, selectedChoices);

    return { msg: "Profile updated successfully!" };
  }
  */
  @Router.get("/posts")
  @Router.validate(z.object({ author: z.string().optional() }))
  async getPosts(author?: string) {
    let posts;
    if (author) {
      const id = (await Authing.getUserByUsername(author))._id;
      posts = await Posting.getByAuthor(id);
    } else {
      posts = await Posting.getPosts();
    }
    return Responses.posts(posts);
  }

  @Router.post("/posts")
  async createPost(session: SessionDoc, content: string, id: string, contentType: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const threadId = new ObjectId(id);
    const created = await Posting.create(user, content, threadId, contentType, options);
    if (created.post != null) {
      await Threading.addToThread(threadId, created.post._id);
    }
    return { msg: created.msg, post: await Responses.post(created.post) };
  }

  @Router.patch("/posts/:id")
  async updatePost(session: SessionDoc, id: string, content?: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    await Posting.assertAuthorIsUser(oid, user);
    return await Posting.update(oid, content, options);
  }

  @Router.delete("/posts/:id")
  async deletePost(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    const post = await Posting.getPostById(oid);
    if (post != null) {
      await Posting.assertAuthorIsUser(oid, user);
      const threadId = post.thread;
      await Threading.removeFromThread(threadId, oid);
      return Posting.delete(oid);
    }
    return { msg: "Unable to find post to delete!" };
  }

  //Threading Routes
  @Router.get("/threads/:familyID")
  async getThreadsInFamily(session: SessionDoc, familyID: ObjectId) {
    familyID = new ObjectId(familyID);
    const threads = await Threading.getThreads(familyID);
    return Responses.threads(threads);
  }

  @Router.get("/threads")
  async getThreadsUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const familyIDs = await Familying.getFamilyIDs(user);
    const threads = await Threading.getThreadsMultipleFamilies(familyIDs);
    return Responses.threads(threads);
  }

  @Router.get("/thread/:id")
  async getThreadById(id: string) {
    const oid = new ObjectId(id);
    const thread = await Threading.getThread(oid);
    return Responses.thread(thread);
  }

  @Router.post("/threads/:familyID")
  //Note: removed function to create post when creating a thread!
  async createThread(session: SessionDoc, title: string, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    const thread = await Threading.createThread(user, title, familyID);
    return { msg: thread.msg, thread: await Responses.thread(thread.thread) };
  }

  @Router.delete("/threads/:id")
  async deleteThread(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const threadId = new ObjectId(id);
    const threadContent = await Threading.getThreadContent(threadId);
    await Threading.assertCreatorIsUser(threadId, user);
    for (const p of threadContent.content) {
      await Posting.delete(p);
    }
    const thread = await Threading.deleteThread(threadId);
    return { msg: thread.msg };
  }

  @Router.patch("/threads/:threadID")
  async editThreadTitle(session: SessionDoc, threadID: string, title: string) {
    const user = Sessioning.getUser(session);
    const threadId = new ObjectId(threadID);
    await Threading.assertCreatorIsUser(threadId, user);
    const thread = await Threading.editThreadTitle(threadId, title);
    return { msg: thread.msg };
  }

  @Router.get("/thread/posts/:threadID")
  async getThreadPosts(threadID: string) {
    const threadId = new ObjectId(threadID);
    const threads = await Threading.getThreadContent(threadId);
    const posts: Array<PostDoc> = await Posting.getManyPostsById(threads.content);
    return Responses.posts(posts);
  }

  @Router.get("/family/invite")
  async getUserInvite(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const requests = await Familying.getInvites(user);
    return requests;
  }

  @Router.get("/family/invite/:familyID")
  async getFamilyInvite(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    await Familying.assertInFamily(user, familyID);
    const requests = await Familying.getFamilyInvites(familyID);
    return requests;
  }

  @Router.post("/family/invite")
  async sendJoinFamilyInviteByUsername(session: SessionDoc, username: string, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    const to = await Authing.getUserByUsername(username);
    familyID = new ObjectId(familyID);
    const request = await Familying.sendInvite(user, to._id, familyID);
    return { msg: request.msg };
  }

  @Router.patch("/family/invite/accept/:familyID")
  async acceptJoinFamilyInvite(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    const request = await Familying.acceptInvite(user, familyID);
    return { msg: request.msg };
  }

  @Router.patch("/family/invite/reject/:familyID")
  async rejectJoinFamilyInvite(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    const request = await Familying.rejectInvite(user, familyID);
    return { msg: request.msg };
  }

  @Router.delete("/family/:familyID/invite/:inviteToID")
  async removeJoinFamilyInvite(session: SessionDoc, familyID: ObjectId, inviteToID: ObjectId) {
    const user = Sessioning.getUser(session);
    inviteToID = new ObjectId(inviteToID);
    familyID = new ObjectId(familyID);
    const request = await Familying.removeFamilyInvite(user, inviteToID, familyID);
    return { msg: request.msg };
  }

  @Router.get("/family")
  async getFamily(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const family = await Familying.getFamilies(user);
    return family;
  }

  @Router.get("/family/name/:familyID")
  async getFamilyName(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    const familyName = await Familying.getFamilyName(user, familyID);
    return familyName;
  }

  @Router.post("/family")
  async createFamily(session: SessionDoc, familyTitle: string) {
    const user = Sessioning.getUser(session);
    const familyCreate = await Familying.createFamily(user, familyTitle);
    return { msg: familyCreate.msg };
  }

  @Router.delete("/family")
  async deleteFamily(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    const familyDelete = await Familying.deleteFamily(user, familyID);
    return { msg: familyDelete.msg };
  }

  @Router.delete("/family/:familyID/member/:username")
  async deleteFamilyMember(session: SessionDoc, familyID: ObjectId, username: string) {
    const user = Sessioning.getUser(session);
    const toDelete = await Authing.getUserByUsername(username);
    familyID = new ObjectId(familyID);
    const toDeleteID = new ObjectId(toDelete._id);
    await Familying.assertInFamily(user, familyID);
    const familyMemberDelete = await Familying.removeFamilyMember(toDeleteID, familyID);
    return { msg: familyMemberDelete.msg };
  }

  @Router.get("/family/member/:familyID")
  async getFamilyMember(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    await Familying.assertInFamily(user, familyID);
    const familyMember = await Familying.getFamilyMember(familyID);
    return familyMember;
  }

  @Router.get("/family/member/name/:familyID")
  async getFamilyMemberUsername(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    familyID = new ObjectId(familyID);
    await Familying.assertInFamily(user, familyID);
    const familyMember = await Familying.getFamilyMember(familyID);
    const familyMemberIDs = familyMember.map((x) => x.userID);
    const familyMemberUsernames = await Authing.idsToUsernames(familyMemberIDs);
    return familyMemberUsernames;
  }

  @Router.get("/archives")
  async getArchives(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const archives = await Archiving.getArchives(user);
    return Responses.archives(archives);
  }

  @Router.get("/archives/content/:id")
  async getArchiveContent(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const oid = new ObjectId(id);
    return await Archiving.getArchiveContent(user, oid);
  }

  @Router.get("/archives/:id")
  async getArchiveById(id: string) {
    const oid = new ObjectId(id);
    const archive = await Archiving.getArchive(oid);
    return Responses.archive(archive);
  }

  @Router.post("/archives")
  async createArchive(session: SessionDoc, posts: Array<string>, timePeriod: string, caption: string) {
    const user = Sessioning.getUser(session);
    const period = new Date(timePeriod);
    const postIds: Array<ObjectId> = [];
    for (const p of posts) {
      const pid = new ObjectId(p);
      postIds.push(pid);
    }
    const created = await Archiving.createArchive(user, postIds, period, caption);
    return { msg: created.msg, post: await Responses.archive(created.archive) };
  }

  @Router.patch("/archives/:id")
  async updateArchiveCaption(session: SessionDoc, id: string, newCaption: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(id);
    return await Archiving.updateCaption(user, item, newCaption);
  }

  @Router.delete("/archives/:id")
  async deleteArchive(session: SessionDoc, id: string) {
    const user = Sessioning.getUser(session);
    const item = new ObjectId(id);
    return await Archiving.deleteArchive(user, item);
  }

  @Router.patch("/archives/:id")
  async addToArchive(session: SessionDoc, archive: string, post: string) {
    const user = Sessioning.getUser(session);
    const archiveId = new ObjectId(archive);
    const postId = new ObjectId(post);
    return await Archiving.addToArchive(user, archiveId, postId);
  }

  @Router.patch("/archives/:id/post/:post")
  async deleteFromArchive(session: SessionDoc, id: string, post: string) {
    const user = Sessioning.getUser(session);
    const archiveId = new ObjectId(id);
    const postId = new ObjectId(post);
    return await Archiving.deleteFromArchive(user, archiveId, postId);
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
