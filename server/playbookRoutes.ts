import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const playbookRouter = router({
  categories: protectedProcedure.query(async ({ ctx }) => {
    return await db.getPlaybookCategories(ctx.user.companyId);
  }),
  
  entriesByCategory: protectedProcedure
    .input(z.object({ categoryId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getPlaybookEntriesByCategory(ctx.user.companyId, input.categoryId);
    }),
  
  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.searchPlaybookEntries(ctx.user.companyId, input.query);
    }),
  
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getPlaybookEntryById(input.id);
    }),
  
  bookmarks: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserPlaybookBookmarks(ctx.user.id);
  }),
  
  addBookmark: protectedProcedure
    .input(z.object({ entryId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.addPlaybookBookmark(ctx.user.id, input.entryId);
      return { success: true };
    }),
  
  removeBookmark: protectedProcedure
    .input(z.object({ entryId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await db.removePlaybookBookmark(ctx.user.id, input.entryId);
      return { success: true };
    }),
  
  isBookmarked: protectedProcedure
    .input(z.object({ entryId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.isPlaybookBookmarked(ctx.user.id, input.entryId);
    }),
});
