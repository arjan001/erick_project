import Home from './pages/Home';
import SubmitProject from './pages/SubmitProject';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "SubmitProject": SubmitProject,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};