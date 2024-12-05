import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface ProfileDoc extends BaseDoc {
  user: ObjectId;
  question: string;
  selectedChoices: string[];
}

/**
 * Concept: Profiling [User, Item]
 */
export default class ProfilingConcept {
  public readonly profiles: DocCollection<ProfileDoc>;

  constructor(collectionName: string) {
    this.profiles = new DocCollection<ProfileDoc>(collectionName);
  }

  /**
   * Ask a question and save the user's selected responses.
   * @param user - The ID of the user.
   * @param question - The question being asked.
   * @param selectedChoices - The user's selected choices.
   */
  async createProfile(user: ObjectId, question: string, selectedChoices: string[]) {
    if (!question || selectedChoices.length === 0) {
      throw new Error("Question and selected choices must be provided.");
    }
    const _id = await this.profiles.createOne({ user, question, selectedChoices });
    return { msg: "Profile successfully created!", profile: await this.profiles.readOne({ _id }) };
  }

  /**
   * Get user with id `id` profile
   * @param _id - The ID of the user.
   */
  async getUserProfile(_id: ObjectId) {
    const profile = await this.profiles.readOne({ user: _id });
    if (!profile) {
      throw new ProfileNotFoundError(_id);
    }
    return profile;
  }

  /**
   * Update the user's profiling data for a specific question.
   * @param user - The ID of the user.
   * @param selectedChoices - The updated responses for the question.
   */
  async updateProfile(user: ObjectId, selectedChoices: string[]) {
    await this.profiles.partialUpdateOne({ user }, { selectedChoices }); // Reuse the ask method to perform the update.
    return { msg: "Profile successfully updated!" };
  }

  /**
   * Retrieve a user's response to a specific question.
   * @param user - The ID of the user.
   * @returns The user's selected choices for the question.
   */
  async getUserResponses(user: ObjectId) {
    const profile = await this.profiles.readOne({ user });
    if (!profile) {
      throw new ProfileNotFoundError(user);
    }
    return profile.selectedChoices;
  }

  async assertAuthorIsUser(_id: ObjectId, user: ObjectId) {
    const profile = await this.profiles.readOne({ _id });
    if (profile != null && profile.user.toString() !== user.toString()) {
      throw new ProfileUserNotMatchError();
    }
  }
}

/**
 * Error for when a profile entry is not found.
 */
export class ProfileNotFoundError extends NotFoundError {
  constructor(user: ObjectId) {
    super(`Profile entry for user ${user} not found!`);
  }
}

export class ProfileUserNotMatchError extends NotAllowedError {
  constructor() {
    super(`You cannot update profile as you are not the profile owner!`);
  }
}
