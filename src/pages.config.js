/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Admin from './pages/Admin';
import ApplyArtist from './pages/ApplyArtist';
import ApplyTeam from './pages/ApplyTeam';
import ArtistAdmin from './pages/ArtistAdmin';
import Contact from './pages/Contact';
import FirstFrame from './pages/FirstFrame';
import Home from './pages/Home';
import Home2 from './pages/Home2';
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
    "Home2": Home2,
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