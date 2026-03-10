import Database from "better-sqlite3";

const db = new Database("carguy.db");
db.pragma("foreign_keys = ON");

db.exec(
    `
-- User
create Table if not exists User (
    UID Integer not null,
    Username Text not null,
    Password Text not null,
    PublicName Text,
    Description Text,
    Title Text, 
    Image Text,
    CreatedAt Text not null,   
    CONSTRAINT PK_User PRIMARY KEY (UID)
) STRICT;

-- Forum_Category
create Table if not exists Forum_Category (
    Forum_Category_id Integer not null,
    Forum_Category_Name Text not null,
    CONSTRAINT PK_Forum_Category PRIMARY KEY (Forum_Category_id)
) STRICT;

-- Post_Category
create Table if not exists Post_Category (
    Post_Category_id Integer not null,
    Post_Category_Name Text not null,
    CONSTRAINT PK_Post_Category PRIMARY KEY (Post_Category_id)
) STRICT;

-- Forum
create Table if not exists Forum (
    ForumID Integer not null,
    Name Text not null,
    Description Text,
    ParentForumID Integer,
    Forum_Category_id Integer,
    CreatedAt Text not null,
    Constraint PK_Forum PRIMARY KEY (ForumID),
    Constraint FK_ForumParent Foreign Key (ParentForumID)
        References Forum (ForumID) 
        On Delete Cascade,
    Constraint FK_Forum_Category Foreign Key (Forum_Category_id)
        References Forum_Category (Forum_Category_id)
) STRICT;

-- Post
create Table if not exists Post (
    PID Integer not null,
    Title Text not null,
    Content Text not null,
    UID Integer not null,
    ForumID Integer not null,
    Post_Category_id Integer,
    PublishedAt Text not null,
    Likes Integer not null default 0,
    Dislikes Integer not null default 0,
    Constraint PK_Post PRIMARY KEY (PID),
    Constraint FK_Post_User Foreign Key (UID)
        References User (UID)
        On Delete Cascade,
    Constraint FK_Post_Forum Foreign Key (ForumID)
        References Forum (ForumID)
        On Delete Cascade,
    Constraint FK_Post_Category Foreign Key (Post_Category_id)
        References Post_Category (Post_Category_id)
) STRICT;

-- Comment
create Table if not exists Comment (
    CID Integer not null,
    Content Text not null,
    UID Integer not null,
    PID Integer not null,
    ParentCID Integer,
    PublishedAt Text not null,
    Likes Integer not null default 0,
    Dislikes Integer not null default 0,
    Constraint PK_Comment PRIMARY KEY (CID),
    Constraint FK_Comment_User Foreign Key (UID)
        References User (UID)
        On Delete Cascade,
    Constraint FK_Comment_Post Foreign Key (PID)
        References Post (PID)
        On Delete Cascade,
    Constraint FK_Comment_Parent Foreign Key (ParentCID)
        References Comment (CID)
        On Delete Cascade
) STRICT;
`
);

export default db;