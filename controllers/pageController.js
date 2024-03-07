const getHomePage = (req, res) => {
    res.render('home', {
        link: 'home',
    });
};

const getBlogsPage = (req, res) => {
    res.render('blogs');
};

const getContactPage = (req, res) => {
    res.render('contact', {
        link:'contact',
    });
};

export {getHomePage, getBlogsPage, getContactPage};