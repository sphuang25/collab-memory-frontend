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

export interface FamilyInviteDoc extends BaseDoc {
  fromID: ObjectId;
  toID: ObjectId;
  familyID: ObjectId;
  status: "pending" | "rejected" | "accepted";
}

/*
 * concept: Friending [User]
 */
export default class FamilyingConcept {
  public readonly families: DocCollection<FamilyDoc>;
  public readonly invites: DocCollection<FamilyInviteDoc>;
  public readonly members: DocCollection<MemberDoc>;

  /**
   * Make an instance of Friending.
   */
  constructor(collectionName: string) {
    this.families = new DocCollection<FamilyDoc>(collectionName);
    this.invites = new DocCollection<FamilyInviteDoc>(collectionName + "_requests");
    this.members = new DocCollection<MemberDoc>(collectionName + "_members");
  }

  private async assertNotInFamily(userID: ObjectId, familyID: ObjectId) {
    const family = await this.members.readOne({ familyID: familyID, userID: userID });
    if (family !== null) {
      throw new AlreadyInFamilyError(userID, familyID);
    }
  }

  private async canSendInvite(fromID: ObjectId, toID: ObjectId, familyID: ObjectId) {
    await this.assertInFamily(fromID, familyID);
    await this.assertNotInFamily(toID, familyID);
    // check if there is pending request between these users
    const request = await this.invites.readOne({
      toID: toID,
      familyID: familyID,
      status: "pending",
    });
    if (request !== null) {
      throw new FamilyRequestAlreadyExistsError(toID, familyID);
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

  private async removeInvite(userID: ObjectId, familyID: ObjectId) {
    const request = await this.invites.popOne({ toID: userID, familyID: familyID, status: "pending" });
    if (request === null) {
      throw new FamilyRequestNotFoundError(userID, familyID);
    }
    return request;
  }

  async getFamilies(userID: ObjectId) {
    const families = await this.members.readMany({ userID: userID });
    return families;
  }

  async getFamiliesUser(userID: ObjectId) {
    const familiesMemberDoc = await this.members.readMany({ userID: userID });
    const families = await this.families.readMany({ _id: { $in: familiesMemberDoc.map((x) => x.familyID) } });
    return families;
  }

  async getFamilyIDs(userID: ObjectId) {
    const families = await this.members.readMany({ userID: userID });
    const familyIDs = families.map((x) => x.familyID);
    return familyIDs;
  }

  async getInvites(userID: ObjectId) {
    return await this.invites.readMany({ toID: userID, status: "pending" });
  }

  async getFamilyInvites(familyID: ObjectId) {
    const invites = await this.invites.readMany({ familyID: familyID, status: "pending" });
    return invites;
  }

  async sendInvite(fromID: ObjectId, toID: ObjectId, familyID: ObjectId) {
    await this.canSendInvite(fromID, toID, familyID);
    await this.invites.createOne({ fromID, toID, familyID, status: "pending" });
    return { msg: "Sent request!" };
  }

  async acceptInvite(userID: ObjectId, familyID: ObjectId) {
    const prevInvite = await this.removeInvite(userID, familyID);
    await Promise.all([this.invites.createOne({ fromID: prevInvite.fromID, toID: userID, familyID: familyID, status: "accepted" }), this.addToFamily(userID, familyID)]);
    return { msg: "Accepted request!" };
  }

  async rejectInvite(userID: ObjectId, familyID: ObjectId) {
    const prevInvite = await this.removeInvite(userID, familyID);
    await this.invites.createOne({ fromID: prevInvite.fromID, toID: userID, familyID: familyID, status: "rejected" });
    return { msg: "Rejected request!" };
  }

  async removeFamilyInvite(userID: ObjectId, inviteToID: ObjectId, familyID: ObjectId) {
    await this.assertInFamily(userID, familyID);
    await this.removeInvite(inviteToID, familyID);
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
    await Promise.all([this.families.deleteOne({ familyID: familyID }), this.invites.deleteMany({ familyID: familyID }), this.members.deleteMany({ familyID: familyID })]);

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

  async getFamilyByName(familyIDs: ObjectId[], familyName: string) {
    const family = await this.families.readOne({ _id: { $in: familyIDs }, familyTitle: familyName });
    if (family === null) {
      throw new FamilyTitleNotExistError(familyName);
    } else {
      return family;
    }
  }
}

export class FamilyNotExistError extends NotFoundError {
  constructor(public familyID: ObjectId) {
    super(`Family ${familyID} does not exists.`);
  }
}

export class FamilyTitleNotExistError extends NotFoundError {
  constructor(public familyName: string) {
    super(`Family with title ${familyName} does not exists.`);
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
    public readonly toID: ObjectId,
    public readonly familyID: ObjectId,
  ) {
    super("invitation to {0} for family {1} already exists!", toID, familyID);
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
