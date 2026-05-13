import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { LoginUser, FindUserByUsername } from "../../../src/application/use-cases/LoginUser";
import { User } from "../../../src/domain/entities/User";
import { AppError } from "../../../src/domain/errors/AppError";

const SECRET = "test-secret";

function makeFinder(users: User[]): FindUserByUsername {
  return async (username) => users.find((u) => u.username === username) ?? null;
}

describe("LoginUser", () => {
  it("retorna JWT quando as credenciais são válidas", async () => {
    const finder = makeFinder([new User("user-1", "john", "123456")]);
    const useCase = new LoginUser(finder, SECRET);

    const out = await useCase.execute({ username: "john", password: "123456" });

    expect(out.user).toEqual({ id: "user-1", username: "john" });
    expect(typeof out.token).toBe("string");

    const decoded = jwt.verify(out.token, SECRET) as { sub: string; username: string };
    expect(decoded.sub).toBe("user-1");
    expect(decoded.username).toBe("john");
  });

  it("lança erro quando o usuário não existe", async () => {
    const useCase = new LoginUser(makeFinder([]), SECRET);

    await expect(
      useCase.execute({ username: "ghost", password: "123456" }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lança erro quando a senha está incorreta", async () => {
    const finder = makeFinder([new User("user-1", "john", "123456")]);
    const useCase = new LoginUser(finder, SECRET);

    await expect(
      useCase.execute({ username: "john", password: "errada" }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
