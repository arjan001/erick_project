import Admin from './pages/Admin';
import ApplyArtist from './pages/ApplyArtist';
import ApplyTeam from './pages/ApplyTeam';
import Contact from './pages/Contact';
import FirstFrame from './pages/FirstFrame';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Services from './pages/Services';
import SubmitProject from './pages/SubmitProject';
import Work from './pages/Work';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "ApplyArtist": ApplyArtist,
    "ApplyTeam": ApplyTeam,
    "Contact": Contact,
    "FirstFrame": FirstFrame,
    "Home": Home,
    "Pricing": Pricing,
    "Services": Services,
    "SubmitProject": SubmitProject,
    "Work": Work,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};