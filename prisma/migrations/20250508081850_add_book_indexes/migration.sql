-- CreateIndex
CREATE INDEX "Book_title_idx" ON "Book"("title");

-- CreateIndex
CREATE INDEX "Book_isbn_idx" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_publisher_idx" ON "Book"("publisher");

-- CreateIndex
CREATE INDEX "Book_publishedYear_idx" ON "Book"("publishedYear");
