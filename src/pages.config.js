import Admin from './pages/Admin';
import ApplyArtist from './pages/ApplyArtist';
import ApplyTeam from './pages/ApplyTeam';
import ArtistAdmin from './pages/ArtistAdmin';
import Contact from './pages/Contact';
import FirstFrame from './pages/FirstFrame';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import ProjectAdmin from './pages/ProjectAdmin';
import Services from './pages/Services';
import SubmitProject from './pages/SubmitProject';
import TeamAdmin from './pages/TeamAdmin';
import Work from './pages/Work';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "ApplyArtist": ApplyArtist,
    "ApplyTeam": ApplyTeam,
    "ArtistAdmin": ArtistAdmin,
    "Contact": Contact,
    "FirstFrame": FirstFrame,
    "Home": Home,
    "Pricing": Pricing,
    "ProjectAdmin": ProjectAdmin,
    "Services": Services,
    "SubmitProject": SubmitProject,
    "TeamAdmin": TeamAdmin,
    "Work": Work,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};