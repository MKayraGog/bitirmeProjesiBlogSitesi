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

const getRegisterPage = (req, res) => {
    res.render('register', {
        link:'register',
    });
};

const getLoginPage = (req, res) => {
    res.render('login', {
        link:'login',
    });
};

export {getHomePage, getBlogsPage, getContactPage, getRegisterPage, getLoginPage};