import { DB } from "../database";
import { Post, User } from "../../data/model";

export class PostRepository {

    public findAllRootPosts(): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            WHERE p.ParentPID IS NULL
        `).all() as any[];
        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public findPostById(id: number, currentUserId?: number): Post | undefined {
        const db = DB.getInstance();

        const row = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.PollData as pollData, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            WHERE p.PID = ?
        `).get(id) as any;

        if (!row) return undefined;

        let poll: any = undefined;
        if (row.pollData) {
            try {
                poll = JSON.parse(row.pollData);
                const votes = db.prepare(`
                    SELECT OptionIndex as optionIndex, COUNT(*) as count
                    FROM PollVote
                    WHERE PID = ?
                    GROUP BY OptionIndex
                `).all(id) as { optionIndex: number, count: number }[];

                if (poll.options) {
                    for (const opt of poll.options) {
                        opt.votes = 0;
                    }
                    for (const vote of votes) {
                        if (poll.options[vote.optionIndex]) {
                            poll.options[vote.optionIndex].votes = vote.count;
                        }
                    }
                }

                if (currentUserId) {
                    const userVote = db.prepare(`
                        SELECT OptionIndex as optionIndex
                        FROM PollVote
                        WHERE PID = ? AND UID = ?
                    `).get(id, currentUserId) as { optionIndex: number } | undefined;
                    if (userVote !== undefined) {
                        poll.userVotedOptionIndex = userVote.optionIndex;
                    }
                }
            } catch (err) {
                console.error("Failed to parse pollData for post ID " + id, err);
            }
        }

        return {
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User,
            poll: poll
        } as Post;
    }

    public findRepliesByParentId(parentId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            WHERE p.ParentPID = ?
        `).all(parentId) as any[];
        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public findPostByForum(forumId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   COUNT(c.CID) as commentCount
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Comment c ON c.PID = p.PID AND c.ParentCID IS NULL
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            WHERE p.ForumID = ?
            GROUP BY p.PID
        `).all(forumId) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public findPostByUser(userId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   COUNT(c.CID) as commentCount
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Comment c ON c.PID = p.PID AND c.ParentCID IS NULL
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            WHERE p.UID = ?
            GROUP BY p.PID
        `).all(userId) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public findPostByCategory(categoryId: number): Post[] {
        const db = DB.getInstance();

        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            WHERE p.Post_Category_id = ?
        `).all(categoryId) as any[];
        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: { forumId: row.forum, name: row.forumName } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public createPost(post: Post): number {
        const db = DB.getInstance();

        const result = db.prepare(`
            INSERT INTO Post
            (Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, PollData, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            post.title ?? null,
            post.content,
            post.author.uid,
            post.forum.forumId,
            null,
            post.category?.postCategoryId ?? null,
            post.publishedAt,
            post.imageUrls ? JSON.stringify(post.imageUrls) : null,
            post.poll ? JSON.stringify({ question: post.poll.question, options: post.poll.options.map((opt: any) => typeof opt === 'string' ? { text: opt } : opt) }) : null,
            0,
            0
        );
        return Number(result.lastInsertRowid);
    }

    public likePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Likes = Likes + 1 WHERE PID = ?`).run(id);
    }

    public unlikePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Likes = MAX(0, Likes - 1) WHERE PID = ?`).run(id);
    }

    public dislikePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Dislikes = Dislikes + 1 WHERE PID = ?`).run(id);
    }

    public undislikePost(id: number): void {
        const db = DB.getInstance();
        db.prepare(`UPDATE Post SET Dislikes = MAX(0, Dislikes - 1) WHERE PID = ?`).run(id);
    }

    public createReply(post: Post): void {
        const db = DB.getInstance();

        db.prepare(`
            INSERT INTO Post
            (Title, Content, UID, ForumID, ParentPID, Post_Category_id, PublishedAt, ImageUrls, Likes, Dislikes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            null,
            post.content,
            post.author.uid,
            post.forum.forumId,
            post.parentPost?.pid ?? null,
            post.category?.postCategoryId ?? null,
            post.publishedAt,
            post.imageUrls ? JSON.stringify(post.imageUrls) : null,
            0,
            0
        );
    }

    public findTrendingPosts(limit: number = 10): Post[] {
        const db = DB.getInstance();
        const minTrending = Math.min(10, limit);

        const recentRows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   fc.Forum_Category_id as forumCategoryId,
                   fc.Forum_Category_Name as forumCategoryName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   COUNT(c.CID) as commentCount,
                   (p.Likes - p.Dislikes + COALESCE(COUNT(c.CID), 0) * 2) as TrendScore
            FROM Post p
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Comment c ON p.PID = c.PID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            WHERE p.ParentPID IS NULL
              AND p.PublishedAt >= datetime('now', '-7 days')
            GROUP BY p.PID
            ORDER BY TrendScore DESC
            LIMIT ?
        `).all(limit) as any[];

        let rows = [...recentRows];

        if (rows.length < minTrending) {
            const excludeIds = rows.map(r => r.pid);
            const remainingCount = minTrending - rows.length;
            const placeholders = excludeIds.length > 0 ? `AND p.PID NOT IN (${excludeIds.map(() => '?').join(',')})` : '';

            const fallbackRows = db.prepare(`
                SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                       u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                       f.Name as forumName,
                       fc.Forum_Category_id as forumCategoryId,
                       fc.Forum_Category_Name as forumCategoryName,
                       (
                           (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                           (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                       ) as authorTotalAura,
                       COUNT(c.CID) as commentCount,
                       (p.Likes - p.Dislikes + COALESCE(COUNT(c.CID), 0) * 2) as TrendScore
                FROM Post p
                LEFT JOIN User u ON p.UID = u.UID
                LEFT JOIN Comment c ON p.PID = c.PID
                LEFT JOIN Forum f ON p.ForumID = f.ForumID
                LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
                WHERE p.ParentPID IS NULL
                  ${placeholders}
                GROUP BY p.PID
                ORDER BY TrendScore DESC
                LIMIT ?
            `).all(...excludeIds, remainingCount) as any[];

            rows = rows.concat(fallbackRows);
        }

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: {
                forumId: row.forum,
                name: row.forumName,
                category: row.forumCategoryId ? {
                    forumCategoryId: row.forumCategoryId,
                    forumCategoryName: row.forumCategoryName
                } : undefined
            } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as User
        })) as Post[];
    }

    public bookmarkPost(uid: number, pid: number): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT OR IGNORE INTO Bookmark (UID, PID) VALUES (?, ?)
        `).run(uid, pid);
    }

    public unbookmarkPost(uid: number, pid: number): void {
        const db = DB.getInstance();
        db.prepare(`
            DELETE FROM Bookmark WHERE UID = ? AND PID = ?
        `).run(uid, pid);
    }

    public isBookmarked(uid: number, pid: number): boolean {
        const db = DB.getInstance();
        const row = db.prepare(`
            SELECT 1 FROM Bookmark WHERE UID = ? AND PID = ?
        `).get(uid, pid);
        return !!row;
    }

    public findBookmarkedPosts(uid: number): Post[] {
        const db = DB.getInstance();
        const rows = db.prepare(`
            SELECT p.PID as pid, p.Title as title, p.Content as content, p.ForumID as forum, p.ParentPID as parentPost, p.Post_Category_id as category, p.PublishedAt as publishedAt, p.ImageUrls as imageUrls, p.Likes as likes, p.Dislikes as dislikes,
                   u.UID as authorUid, u.Username as authorUsername, u.PublicName as authorPublicname, u.Image as authorImage,
                   f.Name as forumName,
                   fc.Forum_Category_id as forumCategoryId,
                   fc.Forum_Category_Name as forumCategoryName,
                   (
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Post WHERE UID = u.UID) + 
                       (SELECT IFNULL(SUM(Likes - Dislikes), 0) FROM Comment WHERE UID = u.UID)
                   ) as authorTotalAura,
                   (SELECT COUNT(*) FROM Comment WHERE PID = p.PID) as commentCount
            FROM Bookmark b
            JOIN Post p ON b.PID = p.PID
            LEFT JOIN User u ON p.UID = u.UID
            LEFT JOIN Forum f ON p.ForumID = f.ForumID
            LEFT JOIN Forum_Category fc ON f.Forum_Category_id = fc.Forum_Category_id
            WHERE b.UID = ?
            ORDER BY p.PublishedAt DESC
        `).all(uid) as any[];

        return rows.map(row => ({
            pid: row.pid,
            title: row.title,
            content: row.content,
            forum: {
                forumId: row.forum,
                name: row.forumName,
                category: row.forumCategoryId ? {
                    forumCategoryId: row.forumCategoryId,
                    forumCategoryName: row.forumCategoryName
                } : undefined
            } as any,
            parentPost: row.parentPost ? { pid: row.parentPost } as any : undefined,
            category: row.category ? { postCategoryId: row.category } as any : undefined,
            publishedAt: row.publishedAt,
            imageUrls: row.imageUrls ? JSON.parse(row.imageUrls) : undefined,
            likes: row.likes,
            dislikes: row.dislikes,
            commentCount: row.commentCount,
            author: {
                uid: row.authorUid,
                username: row.authorUsername,
                publicname: row.authorPublicname,
                image: row.authorImage,
                totalAura: row.authorTotalAura
            } as any
        })) as Post[];
    }

    public recordPollVote(pid: number, uid: number, optionIndex: number): void {
        const db = DB.getInstance();
        db.prepare(`
            INSERT INTO PollVote (PID, UID, OptionIndex)
            VALUES (?, ?, ?)
        `).run(pid, uid, optionIndex);
    }
}