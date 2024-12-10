import { ObjectId } from "mongodb";

import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ThreadDoc extends BaseDoc {
  creator: ObjectId;
  title: string;
  familyID: ObjectId;
  content: Array<ObjectId>;
}

/**
 * concept: Threading [User, Post, Collection, Date]
 */
export default class ThreadingConcept {
  public readonly threads: DocCollection<ThreadDoc>;

  /**
   * Make an instance of Threading.
   */
  constructor(collectionName: string) {
    this.threads = new DocCollection<ThreadDoc>(collectionName);
  }

  //get all threads
  async getThreads(familyID: ObjectId) {
    // Returns all threads from newest to oldest
    return await this.threads.readMany({ familyID: familyID }, { sort: { dateCreated: -1 } });
  }

  async getThreadsMultipleFamilies(familyIDs: ObjectId[]) {
    // Returns all threads from newest to oldest
    return await this.threads.readMany({ familyID: { $in: familyIDs } }, { sort: { dateUpdated: -1 } });
  }

  //get thread with given id
  async getThread(_id: ObjectId) {
    return await this.threads.readOne({ _id });
  }

  //creates new thread
  async createThread(creator: ObjectId, title: string, family: ObjectId) {
    const content: Array<ObjectId> = [];
    const _id = await this.threads.createOne({ creator, title, familyID: family, content });
    return { msg: `Thread successfully created!`, thread: await this.threads.readOne({ _id }) };
  }

  // Returns all posts in thread
  async getThreadContent(_id: ObjectId) {
    const thread = await this.threads.readOne({ _id });
    const content: Array<ObjectId> = [];
    if (thread) {
      for (const p of thread.content) {
        content.push(p);
      }
    } else {
      throw new ThreadNotFoundError(_id);
    }
    return { msg: "Thread content retrieved!", content: content };
  }

  // Edit thread title
  async editThreadTitle(_id: ObjectId, title: string) {
    await this.threads.partialUpdateOne({ _id }, { title });
    return { msg: "Thread title successfully updated!" };
  }

  // Delete thread
  async deleteThread(_id: ObjectId) {
    await this.threads.deleteOne({ _id });
    return { msg: "Thread deleted successfully!" };
  }

  // Add item to thread
  async addToThread(_id: ObjectId, itemId: ObjectId) {
    const thread = await this.threads.readOne({ _id });
    if (thread != null) {
      const contentStrings = thread.content.map((c) => c.toString());
      if (!contentStrings.includes(itemId.toString())) {
        thread.content.push(itemId);
        await this.threads.partialUpdateOne({ _id }, { content: thread.content });
        return { msg: "Post added to thread!" };
      }
    }
    throw new ThreadNotFoundError(_id);
  }

  // Remove post from thread
  async removeFromThread(_id: ObjectId, itemId: ObjectId) {
    const thread = await this.threads.readOne({ _id });
    if (thread != null) {
      const contentStrings = thread.content.map((c) => c.toString());
      if (contentStrings.includes(itemId.toString())) {
        thread.content = thread.content.filter((id) => id.toString() !== itemId.toString());
        await this.threads.partialUpdateOne({ _id }, { content: thread.content });
        return { msg: "Post remove from thread!" };
      }
    }
    return { msg: "Post unable to be removed from thread!" };
  }

  async assertCreatorIsUser(_id: ObjectId, user: ObjectId) {
    const thread = await this.threads.readOne({ _id });
    if (!thread) {
      throw new ThreadNotFoundError(_id);
    }
    if (thread.creator.toString() !== user.toString()) {
      throw new ThreadCreatorNotMatchError(user, _id);
    }
  }
}

export class ThreadCreatorNotMatchError extends NotAllowedError {
  constructor(
    public readonly creator: ObjectId,
    public readonly _id: ObjectId,
  ) {
    super("{0} is not the author of post {1}!", creator, _id);
  }
}

export class ThreadNotFoundError extends NotFoundError {
  constructor(threadId: ObjectId) {
    super(`Thread with id ${threadId} not found!`);
  }
}
