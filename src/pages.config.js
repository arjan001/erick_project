import Home from './pages/Home';
import SubmitProject from './pages/SubmitProject';
import ApplyArtist from './pages/ApplyArtist';
import ApplyTeam from './pages/ApplyTeam';
import Admin from './pages/Admin';
import Work from './pages/Work';
import Services from './pages/Services';
import FirstFrame from './pages/FirstFrame';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "SubmitProject": SubmitProject,
    "ApplyArtist": ApplyArtist,
    "ApplyTeam": ApplyTeam,
    "Admin": Admin,
    "Work": Work,
    "Services": Services,
    "FirstFrame": FirstFrame,
    "Pricing": Pricing,
    "Contact": Contact,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};