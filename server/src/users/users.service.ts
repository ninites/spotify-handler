import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import { CreateUserDto, UserInfos } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, email } = createUserDto;
    const isDuplicate = await this.findDuplicate(email);

    if (isDuplicate) {
      throw new HttpException(
        '[USERS/CREATE] user already exists ',
        HttpStatus.CONFLICT,
      );
    }

    const hashPassword = await this.hashPassword(password);

    const newUser = {
      email: email,
      password: hashPassword,
    };

    return await this.userModel.create(newUser);
  }

  private async findDuplicate(email: string): Promise<boolean> {
    const allUsers = await this.findAll();
    const duplicate = allUsers.find((user) => {
      return user.email === email;
    });
    const result = duplicate ? true : false;
    return result;
  }

  async findAll() {
    return await this.userModel.find();
  }

  async findOne({ id, email }): Promise<UserInfos> {
    const filters: any = {};
    if (id) filters._id = id;
    if (email) filters.email = email;

    return this.userModel.findOne(filters);
  }

  async update(id: string, updateUserDto: any) {
    const filter: any = { _id: id };
    let updateData = {};

    const spotify = updateUserDto.spotify;
    delete updateUserDto.spotify;

    updateData = this.updateLoop(updateUserDto, {
      isNested: false,
      nestName: '',
    });

    if (spotify) {
      const spotifyData = this.updateLoop(spotify, {
        isNested: true,
        nestName: 'spotify',
      });
      updateData = { ...updateData, ...spotifyData };
    }

    return await this.userModel
      .findOneAndUpdate(filter, updateData, { new: true })
      .lean();
  }

  private updateLoop(object, { nestName, isNested }) {
    const result = {};

    for (const key in object) {
      if (object[key]) {
        if (!isNested) {
          result[key] = object[key];
        }
        if (isNested) {
          result[`${nestName}.${key}`] = object[key];
        }
      }
    }
    return result;
  }

  async changeReleases(userId: string, data) {
    const id = { _id: userId };
    const replacement = {
      $set: {
        'spotify.releases': data,
      },
    };
    return this.userModel.findOneAndUpdate(id, replacement, { new: true });
  }

  async removeRelease(userId: string, releaseId: string) {
    const id = { _id: userId };
    const deleteItem = {
      $pull: {
        'spotify.releases': { album_id: releaseId },
      },
    };

    return this.userModel.findOneAndUpdate(id, deleteItem, {
      new: true,
    });
  }

  async hashPassword(password: string) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT);
    const hashPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, saltRounds, function (err, hash) {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });

    return hashPassword;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
