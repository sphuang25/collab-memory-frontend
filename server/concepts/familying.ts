import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface FamilyDoc extends BaseDoc {
  familyTitle: string;
}

export interface MemberDoc extends BaseDoc {
  familyID: ObjectId;
  userID: ObjectId;
}

export interface FamilyRequestDoc extends BaseDoc {
  userID: ObjectId;
  familyID: ObjectId;
  status: "pending" | "rejected" | "accepted";
}

/*
 * concept: Friending [User]
 */
export default class FamilyingConcept {
  public readonly families: DocCollection<FamilyDoc>;
  public readonly requests: DocCollection<FamilyRequestDoc>;
  public readonly members: DocCollection<MemberDoc>;

  /**
   * Make an instance of Friending.
   */
  constructor(collectionName: string) {
    this.families = new DocCollection<FamilyDoc>(collectionName);
    this.requests = new DocCollection<FamilyRequestDoc>(collectionName + "_requests");
    this.members = new DocCollection<MemberDoc>(collectionName + "_members");
  }

  private async assertNotInFamily(userID: ObjectId, familyID: ObjectId) {
    const family = await this.members.readOne({ familyID: familyID, userID: userID });
    if (family !== null) {
      throw new AlreadyInFamilyError(userID, familyID);
    }
  }

  private async canSendRequest(userID: ObjectId, familyID: ObjectId) {
    await this.assertNotInFamily(userID, familyID);
    // check if there is pending request between these users
    const request = await this.requests.readOne({
      userID: userID,
      familyID: familyID,
      status: "pending",
    });
    if (request !== null) {
      throw new FamilyRequestAlreadyExistsError(userID, familyID);
    }
  }

  private async addToFamily(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else {
      await this.members.createOne({ userID: userID, familyID: familyID });
    }
  }

  private async removePendingRequest(userID: ObjectId, familyID: ObjectId) {
    const request = await this.requests.popOne({ userID, familyID, status: "pending" });
    if (request === null) {
      throw new FamilyRequestNotFoundError(userID, familyID);
    }
    return request;
  }

  async getFamilies(userID: ObjectId) {
    const families = await this.members.readMany({ userID: userID });
    return families;
  }

  async getRequests(userID: ObjectId) {
    await this.requests.readMany({ userID: userID, status: "pending" });
  }

  async getFamilyRequests(familyID: ObjectId) {
    await this.requests.readMany({ familyID: familyID, status: "pending" });
  }

  async sendRequest(userID: ObjectId, familyID: ObjectId) {
    await this.canSendRequest(userID, familyID);
    await this.requests.createOne({ userID, familyID, status: "pending" });
    return { msg: "Sent request!" };
  }

  async acceptRequest(userID: ObjectId, familyID: ObjectId) {
    await this.removePendingRequest(userID, familyID);
    await Promise.all([this.requests.createOne({ userID, familyID, status: "accepted" }), this.addToFamily(userID, familyID)]);
    return { msg: "Accepted request!" };
  }

  async rejectRequest(userID: ObjectId, familyID: ObjectId) {
    await this.removePendingRequest(userID, familyID);
    await this.requests.createOne({ userID, familyID, status: "rejected" });
    return { msg: "Rejected request!" };
  }

  async removeRequest(userID: ObjectId, familyID: ObjectId) {
    await this.removePendingRequest(userID, familyID);
    return { msg: "Removed request!" };
  }

  async createFamily(userID: ObjectId, familyTitle: string) {
    if (familyTitle == "") {
      throw new FamilyTitleInvalidError("Family name cannot be empty!");
    }
    const family = await this.families.createOne({ familyTitle: familyTitle });
    await this.addToFamily(userID, family);
    return { msg: `Family ${familyTitle} is created!` };
  }

  async deleteFamily(userID: ObjectId, familyID: ObjectId) {
    await this.assertInFamily(userID, familyID);
    await Promise.all([this.families.deleteOne({ familyID: familyID }), this.requests.deleteMany({ familyID: familyID }), this.members.deleteMany({ familyID: familyID })]);

    return { msg: `Family ${familyID} is deleted!` };
  }

  async removeFamilyMember(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else {
      const member = await this.members.readOne({ familyID: familyID, userID: userID });
      if (member == null) {
        throw new NotInFamilyError(userID, familyID);
      } else {
        await this.members.deleteOne({ familyID: familyID, userID: userID });
      }
    }
    return { msg: "Removed member from family!" };
  }

  async getFamilyMember(familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else {
      return await this.members.readMany({ familyID: familyID });
    }
  }

  async assertInFamily(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    const inFamily = await this.members.readOne({ familyID: familyID, userID: userID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else if (inFamily === null) {
      throw new NotInFamilyError(userID, familyID);
    }
  }

  async getFamilyName(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else {
      return family.familyTitle;
    }
  }
}

export class FamilyNotExistError extends NotFoundError {
  constructor(public familyID: ObjectId) {
    super(`Family ${familyID} does not exists.`);
  }
}

export class FamilyTitleInvalidError extends NotAllowedError {
  constructor(public readonly message: string) {
    super("{0}!", message);
  }
}

export class AlreadyInFamilyError extends NotAllowedError {
  constructor(
    public readonly userID: ObjectId,
    public readonly familyID: ObjectId,
  ) {
    super("{0} is already in family {1}!", userID, familyID);
  }
}

export class NotInFamilyError extends NotAllowedError {
  constructor(
    public readonly userID: ObjectId,
    public readonly familyID: ObjectId,
  ) {
    super("{0} is not in family {1}!", userID, familyID);
  }
}

export class FamilyRequestAlreadyExistsError extends NotAllowedError {
  constructor(
    public readonly userID: ObjectId,
    public readonly familyID: ObjectId,
  ) {
    super("{0} has already sent a request to family {1}!", userID, familyID);
  }
}

export class FamilyRequestNotFoundError extends NotAllowedError {
  constructor(
    public readonly userID: ObjectId,
    public readonly familyID: ObjectId,
  ) {
    super("{0} does not have a pending request to family {1}!", userID, familyID);
  }
}
