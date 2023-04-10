import { faker } from "@faker-js/faker";

import RoleCreateCommand from "./elements/role/dto/RoleCreateCommand";
import roleRepository from "./elements/role/role.repository";
import User from "./elements/user/user.model";

import UserCreateCommand from "./elements/user/dtos/UserCreateCommand";
import userRepository from "./elements/user/user.repository";
import mongoose from "./mongoose";
import { IRole } from "./elements/role/role.model";

(async function () {
  await mongoose(
    "mongodb+srv://root:root@dev.ihdwjf1.mongodb.net/?retryWrites=true&w=majority"
  );

  const seedUsers = async () => {
    for (let i = 0; i < 1000; i++) {
      const command: UserCreateCommand = {
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: "rootroot",
      };

      await userRepository.create(command);
    }
  };

  const seedRoles = async () => {
    const promises: Promise<IRole>[] = [];

    for (let i = 0; i < 1000; i++) {
      const newPromise = new Promise<IRole>(async (resolve, reject) => {
        const command: RoleCreateCommand = {
          name: faker.name.jobTitle(),
          language: "en",
          permissions: [],
          entityPermissions: [],
        };

        const { users } = await userRepository.getUsers({
          paginationCommand: {
            limit: i + 1,
            page: i + 1,
          },
        });

        const role: IRole = await roleRepository.create(command);
        await User.updateOne(
          { _id: { $in: users.map((u) => u._id) } },
          { role: role._id }
        );

        resolve(role);
      });

      promises.push(newPromise);
    }

    await Promise.all(promises);
  };

  seedUsers();
  seedRoles();
  console.log("finished seeding");
})();
