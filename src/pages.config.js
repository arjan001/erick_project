import Home from './pages/Home';
import SubmitProject from './pages/SubmitProject';
import ApplyArtist from './pages/ApplyArtist';
import ApplyTeam from './pages/ApplyTeam';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "SubmitProject": SubmitProject,
    "ApplyArtist": ApplyArtist,
    "ApplyTeam": ApplyTeam,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};