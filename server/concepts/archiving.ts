import { ObjectId } from "mongodb";
import DocCollection, { BaseDoc } from "../framework/doc";
import { BadValuesError, NotAllowedError } from "./errors";

export interface ArchiveDoc extends BaseDoc {
  content: ObjectId[];
  creator: ObjectId;
  timePeriod: Date;
  caption: string;
}

/**
 * concept: Archiving
 */
export default class UserProfilingConcept {
  public readonly archives: DocCollection<ArchiveDoc>;

  constructor(collectionName: string) {
    this.archives = new DocCollection<ArchiveDoc>(collectionName);
  }

  async createArchive(creator: ObjectId, posts: ObjectId[], timePeriod: Date, caption: string) {
    const archive = await this.archives.createOne({ creator: creator, content: posts, timePeriod: timePeriod, caption: caption });
    return archive;
  }

  async updateCaption(editor: ObjectId, archiveItem: ObjectId, newCaption: string) {
    const archive = await this.archives.readOne({ _id: archiveItem });
    if (archive === undefined) {
      throw new ArchiveNotExistError(archiveItem);
    } else if (archive?.creator.toString() !== editor.toString()) {
      throw new NotCreatorOfArchiveError(editor, archiveItem);
    } else {
      const archive = await this.archives.partialUpdateOne({ _id: archiveItem }, { caption: newCaption });
      return archive;
    }
  }

  async deleteArchive(editor: ObjectId, archiveItem: ObjectId) {
    const archive = await this.archives.readOne({ _id: archiveItem });
    if (archive === undefined) {
      throw new ArchiveNotExistError(archiveItem);
    } else if (archive?.creator.toString() !== editor.toString()) {
      throw new NotCreatorOfArchiveError(editor, archiveItem);
    } else {
      const archive = await this.archives.deleteOne({ _id: archiveItem });
      return archive;
    }
  }

  async addToArchive(editor: ObjectId, archiveItem: ObjectId, post: ObjectId) {
    const archive = await this.archives.readOne({ _id: archiveItem });
    if (archive === null) {
      throw new ArchiveNotExistError(archiveItem);
    } else {
      if (archive.content.includes(post)) {
        throw new PostAlreadyInArchiveError(post, archiveItem);
      } else {
        archive.content.push(post);
      }
      return archive;
    }
  }

  async deleteFromArchive(editor: ObjectId, archiveItem: ObjectId, post: ObjectId) {
    const archive = await this.archives.readOne({ _id: archiveItem });
    if (archive === null) {
      throw new ArchiveNotExistError(archiveItem);
    } else if (archive?.creator.toString() !== editor.toString()) {
      throw new NotCreatorOfArchiveError(editor, archiveItem);
    } else {
      if (!archive.content.includes(post)) {
        throw new PostNotInArchiveError(post, archiveItem);
      } else {
        const idx = archive.content.indexOf(post);
        archive.content.splice(idx, 1);
      }
      return archive;
    }
  }
}

export class ArchiveNotExistError extends BadValuesError {
  constructor(archive: ObjectId) {
    super(`Archive ${archive} is not found.`);
  }
}

export class NotCreatorOfArchiveError extends NotAllowedError {
  constructor(editBy: ObjectId, archive: ObjectId) {
    super(`You can not edit archive ${archive} because user ${editBy} is not the creator.`);
  }
}

export class PostAlreadyInArchiveError extends NotAllowedError {
  constructor(post: ObjectId, archive: ObjectId) {
    super(`Post ${post} is already in archive ${archive}.`);
  }
}

export class PostNotInArchiveError extends NotAllowedError {
  constructor(post: ObjectId, archive: ObjectId) {
    super(`Post ${post} is not in archive ${archive}.`);
  }
}
