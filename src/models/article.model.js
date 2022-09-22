const mongoose = require("mongoose");
const { toJSON } = require("./plugins");

const articleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      _id: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
        trim: true,
      },
    },
    content: {
      type: String,
      required: true,
      trim: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
articleSchema.plugin(toJSON);

/**
 * Check if article name is taken
 * @param {string} name - The article's name
 * @param {string} excludeUserId - excludeUserId
 * @returns {Promise<boolean>}
 */
articleSchema.statics.isNameTaken = async function (name, excludeUserId) {
  const article = await this.findOne({ name, _id: { $ne: excludeUserId } });
  return !!article;
};

/**
 * @typedef Articles
 */
const Articles = mongoose.model("Articles", articleSchema);

module.exports = Articles;
