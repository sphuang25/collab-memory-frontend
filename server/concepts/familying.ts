import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { NotAllowedError, NotFoundError } from "./errors";

export interface FamilyDoc extends BaseDoc {
  familyTitle: string;
  members: ObjectId[];
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

  /**
   * Make an instance of Friending.
   */
  constructor(collectionName: string) {
    this.families = new DocCollection<FamilyDoc>(collectionName);
    this.requests = new DocCollection<FamilyRequestDoc>(collectionName + "_requests");
  }

  private async assertNotInFamily(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else if (
      family.members
        .map((x) => {
          return x.toString();
        })
        .includes(userID.toString())
    ) {
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
      family.members.push(userID);
    }
  }

  private async removePendingRequest(userID: ObjectId, familyID: ObjectId) {
    const request = await this.requests.popOne({ userID, familyID, status: "pending" });
    if (request === null) {
      throw new FamilyRequestNotFoundError(userID, familyID);
    }
    return request;
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

  async removeFamilyMember(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else {
      for (let i = 0; i < family.members.length; i++) {
        if (family.members[i].toString() == userID.toString()) {
          family.members.splice(i, 1);
          break;
        }
      }
    }
    return { msg: "Removed member from family!" };
  }

  async isInFamily(userID: ObjectId, familyID: ObjectId) {
    const family = await this.families.readOne({ _id: familyID });
    if (family === null) {
      throw new FamilyNotExistError(familyID);
    } else {
      return family.members
        .map((x) => {
          return x.toString();
        })
        .includes(userID.toString());
    }
  }
}

export class FamilyNotExistError extends NotFoundError {
  constructor(public familyID: ObjectId) {
    super(`Family ${familyID} does not exists.`);
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
