const mongoose= require('../connection');

const Schema = mongoose.Schema;
const ContentSchema = new Schema({
    priority: Number,
    type: String,
    subHeading: String,
    data: String
})

const BlogTemplate = new Schema({


    blogId: String,
    content: [
        ContentSchema
    ]
})

module.exports = {
    BlogTemplate: mongoose.model('BlogTemplates', BlogTemplate),
    ContentTemplate: mongoose.model('ContentTemplate', ContentSchema)
}