import { testIds } from "@/views/helpers/testIds";
import { test, expect, Page } from "@playwright/test";
import { getSampleAccount } from "../src/infra/getSampleAccount";

const { describe } = test;

type SetupParams = {
  page: Page;
  title?: string;
  text?: string;
};
const loginUser = async ({ page }: SetupParams) => {
  const sampleAccount = await getSampleAccount();

  await page.goto("http://localhost:3000/");

  const emailInputLocator = page.getByTestId(testIds.loginEmailInput);
  const passwordInputLocator = page.getByTestId(testIds.loginPasswordInput);

  await emailInputLocator.fill(sampleAccount.email);
  await passwordInputLocator.fill(sampleAccount.password);

  await page.getByTestId(testIds.loginButton).click();
};

const fillForm = async ({ page, title = "", text = "" }: SetupParams) => {
  await loginUser({ page });
  await page.getByTestId("add-note-button").click();

  const titleInput = page.getByTestId("add-note-form-title-input");
  const textInput = page.getByTestId("add-note-form-text-input");

  await expect(titleInput).toBeVisible();
  await expect(textInput).toBeVisible();

  await titleInput.fill(title);
  await textInput.fill(text);

  await page.getByTestId("add-note-form-submit-button").click();
};

describe("Create note flow", () => {
  describe("When user clicks on add note button", () => {
    test("It Should render create note modal form", async ({ page }) => {
      await loginUser({ page });
      await page.getByTestId("add-note-button").click();

      await expect(page.getByTestId("add-note-form")).toBeVisible();
      await expect(page.getByText("Title")).toBeVisible();
      await expect(page.getByTestId("add-note-form-title-input")).toBeVisible();
      await expect(page.getByText("Text")).toBeVisible();
      await expect(page.getByTestId("add-note-form-text-input")).toBeVisible();
    });

    describe("And clicks on cancel button", () => {
      test("It should dismiss the modal", async ({ page }) => {
        await loginUser({ page });
        await page.getByTestId("add-note-button").click();

        await page.getByTestId("add-note-form-cancel-button").click();

        await expect(page.getByTestId("add-note-form")).not.toBeVisible();
      });
    });
    describe("And clicks outside of modal", () => {
      test("It should dismiss the modal", async ({ page }) => {
        await loginUser({ page });
        await page.getByTestId("add-note-button").click();

        await page
          .getByTestId("modal-overlay")
          .click({ position: { x: 0, y: 0 } });

        await expect(page.getByTestId("add-note-form")).not.toBeVisible();
      });
    });

    describe("And fill the form to creates a note", () => {
      describe("And data is valid", () => {
        test("It should create a new note", async ({ page }) => {
          const notesLength = (
            await page.getByTestId(/note-preview-card-/i).all()
          ).length;

          await fillForm({
            page,
            title: "new note",
            text: "this is a new note",
          });

          await page.waitForURL("/");

          const newNotesLength = (
            await page.getByTestId(/note-preview-card-/i).all()
          ).length;

          expect(newNotesLength).toBeGreaterThan(notesLength);
          await expect(page.getByText("new note")).toBeVisible();
          await expect(page.getByText("this is a new note")).toBeVisible();
        });
      });

      // describe("And data is invalid", () => {});
    });
  });
});
