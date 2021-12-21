USE [LeafDB] -- replace with site DB
GO

-- TABLES

DROP TABLE IF EXISTS [app].[HelpPageContent]
DROP TABLE IF EXISTS [app].[HelpPage]
DROP TABLE IF EXISTS [app].[HelpPageCategory]

-- Create table listing categories
DROP TABLE IF EXISTS [app].[HelpPageCategory]
GO

CREATE TABLE [app].[HelpPageCategory] (
    Id [UNIQUEIDENTIFIER] DEFAULT (NEWSEQUENTIALID()) NOT NULL PRIMARY KEY,
    Category NVARCHAR(255) NOT NULL UNIQUE
)
GO


-- Create table listing help pages
DROP TABLE IF EXISTS [app].[HelpPage]
GO

CREATE TABLE [app].[HelpPage] (
    Id [UNIQUEIDENTIFIER] DEFAULT (NEWSEQUENTIALID()) NOT NULL PRIMARY KEY,
    CategoryId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [LeafDB].[app].[HelpPageCategory](Id),
    Title NVARCHAR(400) NOT NULL
)
GO


-- Create table holding content for help pages
DROP TABLE IF EXISTS [app].[HelpPageContent]
GO

CREATE TABLE [app].[HelpPageContent] (
    Id [UNIQUEIDENTIFIER] DEFAULT (NEWSEQUENTIALID()) NOT NULL PRIMARY KEY,
    PageId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES [LeafDB].[app].[HelpPage](Id),
    OrderId INT NOT NULL,
    Type NVARCHAR(255) NOT NULL,
    TextContent NVARCHAR(MAX) NULL,
    ImageId NVARCHAR(255) NULL,
    ImageContent VARBINARY(MAX) NULL,
    ImageSize INT NULL
)
GO

-- STORED PROCEDURES

-- SP to get all categories
DROP PROCEDURE IF EXISTS [app].[sp_GetHelpCategories]
GO

CREATE PROCEDURE [app].[sp_GetHelpCategories]
AS
BEGIN
    SELECT Id, Category
    FROM app.HelpPageCategory
END
GO


-- SP to get all help pages
DROP PROCEDURE IF EXISTS [app].[sp_GetHelpPages]
GO

CREATE PROCEDURE [app].[sp_GetHelpPages]
AS
BEGIN
    SELECT Id, CategoryId, Title
    FROM app.HelpPage
END
GO


-- SP to get content for a page
DROP PROCEDURE IF EXISTS [app].[sp_GetHelpPageContentByPageId]
GO

CREATE PROCEDURE [app].[sp_GetHelpPageContentByPageId]
    @pageId UNIQUEIDENTIFIER
AS
BEGIN
    -- Throws error if page content does not exist.
    IF ((SELECT COUNT(*) FROM app.HelpPageContent WHERE PageId = @pageId) = 0)
        THROW 70404, 'Content not found and/or does not exist for page.', 1;

    SELECT Id, PageId, OrderId, Type, TextContent, ImageId, ImageContent, ImageSize
    FROM app.HelpPageContent
    WHERE PageId = @pageId;
END
GO


-- ADMIN STORED PROCEDURES

-- User defined table for Admin SP Create and Update
DROP TYPE IF EXISTS [adm].[HelpContentTable]
GO

CREATE TYPE [adm].[HelpContentTable] AS TABLE(
	[PageId] [UNIQUEIDENTIFIER] NOT NULL,
	[Category] [NVARCHAR](255) NOT NULL,
	[Title] [NVARCHAR](400) NOT NULL,
	[OrderId] [INT] NOT NULL,
	[Type] [NVARCHAR](255) NOT NULL,
	[TextContent] [NVARCHAR](MAX) NULL,
	[ImageId] [NVARCHAR](255) NULL,
    [ImageContent] [VARBINARY](MAX) NULL,
    [ImageSize] [INT] NULL
)
GO


-- SP to get help page title, category, and content
DROP PROCEDURE IF EXISTS [adm].[sp_GetHelpPageAndContent]
GO

CREATE PROCEDURE [adm].[sp_GetHelpPageAndContent]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    IF NOT EXISTS(SELECT 1 FROM app.HelpPage WHERE Id = @id)
        THROW 70404, N'Could not find page and/or does not exist.', 1;
    
    SELECT Title
    FROM app.HelpPage
    WHERE Id = @id
    
    SELECT Category
    FROM app.HelpPageCategory
    WHERE Id = (SELECT CategoryId FROM app.HelpPage WHERE Id = @id)

    SELECT Id, PageId, OrderId, Type, TextContent, ImageId, ImageContent, ImageSize
    FROM app.HelpPageContent
    WHERE PageId = @id
END
GO


-- SP to update help page title, content, and category
DROP PROCEDURE IF EXISTS [adm].[sp_UpdateHelpPageAndContent]
GO

CREATE PROCEDURE [adm].[sp_UpdateHelpPageAndContent]
    @content adm.HelpContentTable READONLY
AS
BEGIN
    DECLARE @category NVARCHAR(255)
    SET @category = (SELECT TOP(1) Category FROM @content)

    DECLARE @pageId UNIQUEIDENTIFIER
    SET @pageId = (SELECT TOP(1) PageId FROM @content)

    DECLARE @title NVARCHAR(400)
    SET @title = (SELECT TOP(1) Title FROM @content)

    DECLARE @type NVARCHAR(255)
    SET @type = (SELECT TOP(1) Type FROM @content)

    DECLARE @orderId INT
    SET @orderId = (SELECT TOP(1) OrderId FROM @content)

    DECLARE @categoryId UNIQUEIDENTIFIER
    SET @categoryId = (SELECT Id FROM app.HelpPageCategory WHERE Category = @category)

    IF NOT EXISTS(SELECT 1 FROM app.HelpPage WHERE Id = @pageId)
        THROW 70404, N'Could not find page and/or does not exist.', 1;
    IF NOT EXISTS(SELECT 1 FROM app.HelpPageCategory WHERE Category = @category)
        THROW 70404, N'Could not find category and/or does not exist.', 1;
    IF (app.fn_NullOrWhitespace(@title) = 1)
        THROW 70400, N'Title is required.', 1;
    IF (app.fn_NullOrWhitespace(@category) = 1)
        THROW 70400, N'Category is required.', 1;
    IF (app.fn_NullOrWhitespace(@orderId) = 1)
        THROW 70400, N'Page order number is required.', 1;
    IF (app.fn_NullOrWhitespace(@type) = 1)
        THROW 70400, N'Content type is required.', 1;
    
    UPDATE app.HelpPage
    SET
        Title = @title,
        CategoryId = (SELECT Id FROM app.HelpPageCategory WHERE Category = @category)
    WHERE Id = @pageId

    DELETE FROM app.HelpPageContent
    WHERE PageId = @pageId

    INSERT INTO app.HelpPageContent (PageId, OrderId, Type, TextContent, ImageId, ImageContent, ImageSize)
    SELECT PageId, OrderId, Type, TextContent, ImageId, ImageContent, ImageSize
    FROM @content

    EXEC adm.sp_GetHelpPageAndContent @pageId
END
GO


-- SP to create help page title, content, and category
DROP PROCEDURE IF EXISTS [adm].[sp_CreateHelpPageAndContent]
GO

CREATE PROCEDURE [adm].[sp_CreateHelpPageAndContent]
    @content adm.HelpContentTable READONLY
AS
BEGIN
    DECLARE @title NVARCHAR(400)
    SET @title = (SELECT TOP(1) Title FROM @content)

    DECLARE @category NVARCHAR(255)
    SET @category = (SELECT TOP(1) Category FROM @content)

    DECLARE @orderId INT
    SET @orderId = (SELECT TOP(1) OrderId FROM @content)

    IF (@category IS NOT NULL AND NOT EXISTS(SELECT 1 FROM app.HelpPageCategory WHERE Category = @category))
        INSERT INTO app.HelpPageCategory (Category) SELECT Category = @category

    DECLARE @categoryId UNIQUEIDENTIFIER
    SET @categoryId = (SELECT Id FROM app.HelpPageCategory WHERE Category = @category)
        
    IF (app.fn_NullOrWhitespace(@title) = 1)
        THROW 70400, N'Title is required.', 1;
        
    IF (app.fn_NullOrWhitespace(@category) = 1)
        THROW 70400, N'Category is required.', 1;

    IF EXISTS(SELECT 1 FROM app.HelpPage WHERE Title = @title AND CategoryId = @categoryId)
        THROW 70409, N'Page title and category already exist.', 1;
    
    DECLARE @pageIdTable Table (PageId UNIQUEIDENTIFIER);

    INSERT INTO app.HelpPage (Title, CategoryId)
    OUTPUT inserted.Id
    INTO @pageIdTable
    SELECT Title = @title, CategoryId = @categoryId

    DECLARE @pageId UNIQUEIDENTIFIER;
    SELECT @pageId = PageId FROM @pageIdTable;

    INSERT INTO app.HelpPageContent (PageId, OrderId, Type, TextContent, ImageId, ImageContent, ImageSize)
    SELECT
        PageId = (CASE WHEN PageId IS NULL THEN (SELECT Id FROM app.HelpPage WHERE Title = @title AND CategoryId = @categoryId) ELSE @pageId END),
        OrderId, Type, TextContent, ImageId, ImageContent, ImageSize
    FROM @content

    EXEC adm.sp_GetHelpPageAndContent @pageId
END
GO


-- SP to delete help page title, content, and category
DROP PROCEDURE IF EXISTS [adm].[sp_DeleteHelpPageAndContent]
GO

CREATE PROCEDURE [adm].[sp_DeleteHelpPageAndContent]
    @id UNIQUEIDENTIFIER
AS
BEGIN
    DECLARE @categoryId UNIQUEIDENTIFIER
    SET @categoryId = (SELECT CategoryId FROM app.HelpPage WHERE Id = @id)

    IF (NOT EXISTS(SELECT 1 FROM app.HelpPage WHERE Id = @id))
        THROW 70404, N'Could not find page and/or does not exist.', 1;

    DELETE FROM app.HelpPageContent
    WHERE PageId = @id

    DELETE FROM app.HelpPage
    OUTPUT deleted.Id
    WHERE Id = @id
    
    IF ((SELECT COUNT(*) FROM app.HelpPage WHERE CategoryId = @categoryId) = 0)
    BEGIN;
        DELETE FROM app.HelpPageCategory
        WHERE Id = @categoryId
    END;
END
GO
