import { Book, PrismaClient, Prisma } from "@prisma/client";
import { getCachedBooks, setCachedBooks, generateCacheKey } from "./redis.service";

const prisma = new PrismaClient();

interface SearchOptions {
  limit?: number;
  page?: number;
  getAll?: boolean;
  genres?: string[];
}

export const searchBooks = async (
  search: string,
  options: SearchOptions = {}
): Promise<{ books: Book[]; total: number }> => {
  const { limit = 50, page = 1, getAll = false, genres } = options;

  // Try to get from cache first
  const cacheKey = generateCacheKey(search, options);
  const cachedResult = await getCachedBooks(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }
  
  // Base query conditions
  const whereConditions: Prisma.BookWhereInput = !search.trim() ? {} : {
    OR: [
      {
        title: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      },
      {
        authorList: {
          hasSome: search.toLowerCase().split(' ').map(term => term.trim()).filter(Boolean)
        }
      },
      {
        genreList: {
          hasSome: search.toLowerCase().split(' ').filter(Boolean)
        }
      },
      {
        publisher: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      },
      {
        isbn: {
          contains: search,
          mode: Prisma.QueryMode.insensitive
        }
      }
    ]
  };

  // Add genre filter if provided
  if (genres && genres.length > 0) {
    whereConditions.AND = [
      {
        genreList: {
          hasSome: genres
        }
      }
    ];
  }

  // Get total count
  const total = await prisma.book.count({ where: whereConditions });

  // Get books with pagination
  const books = await prisma.book.findMany({
    where: whereConditions,
    orderBy: [
      {
        title: 'asc'
      }
    ],
    ...(getAll ? {} : {
      take: limit,
      skip: (page - 1) * limit
    })
  });

  const result = {
    books,
    total
  };

  // Cache the result
  await setCachedBooks(cacheKey, result);

  return result;
};

export const getBookByIdService = async (id: string): Promise<Book | null> => {
  return prisma.book.findUnique({ 
    where: { id },
    include: {
      actions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 10 // Get only recent actions
      }
    }
  });
};
