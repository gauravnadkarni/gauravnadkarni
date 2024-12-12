const updateReadme = require('./scripts/update-blog-posts');

(() => {
    updateReadme().then(()=>console.log("Job successfully completed")).catch(error => console.error(error));
})();