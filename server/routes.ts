import { ObjectId } from "mongodb";

import { Router, getExpressRouter } from "./framework/router";

import { Authing, Familying, Posting, Profiling, Sessioning, Threading } from "./app";
import { PostDoc, PostOptions } from "./concepts/posting";
import { SessionDoc } from "./concepts/sessioning";
import { ThreadDoc } from "./concepts/threading";
import Responses from "./responses";

import { z } from "zod";

/**
 * Web server routes for the app. Implements synchronizations between concepts.
 */
class Routes {
  // Profiling question and options
  private readonly profilingQuestion = "What are your goals in Fam.ly?";
  private readonly profilingOptions = ["Learn family history", "Connect more often", "Learn others' interests", "Learn about identity"];

  @Router.get("/session")
  async getSessionUser(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    return await Authing.getUserById(user);
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
  @Router.validate(
    z.object({
      username: z.string().min(1),
      password: z.string().min(1),
      profileResponses: z.array(z.string()).optional(),
    }),
  )
  async createUser(session: SessionDoc, username: string, password: string, profileResponses?: string[]) {
    Sessioning.isLoggedOut(session);

    if (profileResponses && profileResponses.length > 0) {
      const invalidChoices = profileResponses.filter((choice) => !this.profilingOptions.includes(choice));
      if (invalidChoices.length > 0) {
        throw new Error(`Invalid choices: ${invalidChoices.join(", ")}`);
      }
    }

    const result = await Authing.create(username, password);
    const user = result.user;

    if (!user) {
      throw new Error("User creation failed.");
    }

    if (profileResponses && profileResponses.length > 0) {
      await Profiling.ask(user._id, this.profilingQuestion, profileResponses);
    }

    return { msg: "User created successfully!", user };
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
   * Profile Update: Update the profiling responses for a user.
   */
  @Router.patch("/profile")
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
  async createPost(session: SessionDoc, content: string, id: string, options?: PostOptions) {
    const user = Sessioning.getUser(session);
    const threadId = new ObjectId(id);
    const created = await Posting.create(user, content, threadId, options);
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
  @Router.get("/threads")
  async getThreads(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const threads = await Threading.getThreads();
    const userThreads: Array<ThreadDoc> = [];
    for (const t of threads) {
      if (t.members.includes(user) || t.creator.toString() === user.toString()) {
        userThreads.push(t);
      }
    }
    return Responses.threads(userThreads);
  }

  @Router.get("/thread/:id")
  async getThreadById(id: string) {
    const oid = new ObjectId(id);
    const thread = await Threading.getThread(oid);
    return Responses.thread(thread);
  }

  @Router.post("/threads")
  //Note: removed function to create post when creating a thread!
  async createThread(session: SessionDoc, title: string, threadContent: string, members: string) {
    const user = Sessioning.getUser(session);
    let content: Array<ObjectId> = [];
    let memberList: Array<ObjectId> = [];
    if (threadContent) {
      content = threadContent.split(",").map((id) => new ObjectId(id));
    }
    if (members) {
      memberList = members.split(",").map((id) => new ObjectId(id));
    }
    const thread = await Threading.createThread(user, title, content, memberList);
    return { msg: thread.msg, thread: await Responses.thread(thread.thread) };
  }

  @Router.delete("/threads")
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

  @Router.patch("/threads/:id")
  async editThreadTitle(session: SessionDoc, id: string, title: string) {
    const user = Sessioning.getUser(session);
    const threadId = new ObjectId(id);
    await Threading.assertCreatorIsUser(threadId, user);
    const thread = await Threading.editThreadTitle(threadId, title);
    return { msg: thread.msg };
  }

  @Router.get("/threads/:id")
  async getThreadPosts(id: string) {
    const threadId = new ObjectId(id);
    const threads = await Threading.getThreadContent(threadId);
    const posts: Array<PostDoc> = await Posting.getManyPostsById(threads.content);
    return Responses.posts(posts);
  }

  @Router.patch("/joinThreads/:id")
  async joinThread(id: string, session: SessionDoc) {
    const threadId = new ObjectId(id);
    const user = Sessioning.getUser(session);
    const thread = await Threading.joinThread(threadId, user);
    return { msg: thread.msg };
  }

  @Router.patch("/leaveThreads/:id")
  async leaveThread(id: string, session: SessionDoc) {
    const threadId = new ObjectId(id);
    const user = Sessioning.getUser(session);
    const thread = await Threading.leaveThread(threadId, user);
    return { msg: thread.msg };
  }

  @Router.get("/family/request")
  async getUserRequest(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const requests = await Familying.getRequests(user);
    return requests;
  }

  @Router.get("/family/request/:id")
  async getFamilyRequest(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    await Familying.assertInFamily(user, familyID);
    const requests = await Familying.getFamilyRequests(familyID);
    return requests;
  }

  @Router.post("/family/request")
  async sendJoinFamilyRequest(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    const request = await Familying.sendRequest(user, familyID);
    return { msg: request.msg };
  }

  @Router.patch("/family/request/accept")
  async acceptJoinFamilyRequest(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    const request = await Familying.acceptRequest(user, familyID);
    return { msg: request.msg };
  }

  @Router.patch("/family/request/reject")
  async rejectJoinFamilyRequest(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    const request = await Familying.rejectRequest(user, familyID);
    return { msg: request.msg };
  }

  @Router.delete("/family/request")
  async removeJoinFamilyRequest(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    const request = await Familying.removeRequest(user, familyID);
    return { msg: request.msg };
  }

  @Router.get("/family")
  async getFamily(session: SessionDoc) {
    const user = Sessioning.getUser(session);
    const family = await Familying.getFamilies(user);
    return family;
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
    const familyDelete = await Familying.deleteFamily(user, familyID);
    return { msg: familyDelete.msg };
  }

  @Router.delete("/family/member")
  async deleteFamilyMember(session: SessionDoc, familyID: ObjectId, toDelete: ObjectId) {
    const user = Sessioning.getUser(session);
    await Familying.assertInFamily(user, familyID);
    const familyMemberDelete = await Familying.removeFamilyMember(toDelete, familyID);
    return { msg: familyMemberDelete.msg };
  }

  @Router.get("/family/member")
  async getFamilyMember(session: SessionDoc, familyID: ObjectId) {
    const user = Sessioning.getUser(session);
    await Familying.assertInFamily(user, familyID);
    const familyMember = await Familying.getFamilyMember(familyID);
    const familyMemberUsername = await Authing.idsToUsernames(
      familyMember.map((x) => {
        return x.userID;
      }),
    );
    return { msg: "Get family member success!", names: familyMemberUsername };
  }
}

/** The web app. */
export const app = new Routes();

/** The Express router. */
export const appRouter = getExpressRouter(app);
