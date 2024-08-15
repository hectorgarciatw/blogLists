const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

// Count the number of blogs by each author
const mostBlogs = (blogs) => {
    const authorCounts = blogs.reduce((counts, blog) => {
        counts[blog.author] = (counts[blog.author] || 0) + 1;
        return counts;
    }, {});

    // Return the author with most blogs entries
    return Object.entries(authorCounts).reduce(
        (max, [author, count]) => {
            if (count > max.count) {
                return { author, count };
            }
            return max;
        },
        { author: null, count: 0 }
    );
};

// Count the number of blogs by each author
const mostLikes = (blogs) => {
    const authorLikes = blogs.reduce((likes, blog) => {
        likes[blog.author] = (likes[blog.author] || 0) + blog.likes;
        return likes;
    }, {});

    // Return the author with the most total likes
    return Object.entries(authorLikes).reduce(
        (max, [author, totalLikes]) => {
            if (totalLikes > max.likes) {
                return { author, likes: totalLikes };
            }
            return max;
        },
        { author: null, likes: 0 }
    );
};

module.exports = {
    dummy,
    totalLikes,
    mostBlogs,
    mostLikes,
};
