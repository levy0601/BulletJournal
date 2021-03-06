import React from 'react';
import ReactDOM from 'react-dom';
import App, {Loading} from './App';
import createStore from './store';
import {Provider} from 'react-redux';
import {BrowserRouter, HashRouter, Route, Switch} from 'react-router-dom';
import {unregister} from './serviceWorker';
import PublicPage from './Public';
import PrivacyPage from './Privacy';
import TermsOfServicePage from './TermsOfService';
import TemplatesPage from './templates';

const store = createStore();

function getCookie(cname: string) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function listen() {
    if (document.readyState === 'complete') {
        if (process.env.NODE_ENV === 'production') {
            const loginCookie = getCookie('__discourse_proxy');
            console.log('loginCookie ' + loginCookie);
            if (!loginCookie) {
                if (caches) {
                    // Service worker cache should be cleared with caches.delete()
                    caches.keys().then(function (names) {
                        for (let name of names) caches.delete(name).then(r => console.log(r));
                    });
                }
                window.location.reload();
            }
        }
        ReactDOM.render(
            <Provider store={store}>
                <BrowserRouter>
                    <Switch>
                        <Route exact path="/public/privacy" component={PrivacyPage}/>
                        <Route exact path="/public/tos" component={TermsOfServicePage}/>
                        <Route exact path="/public/templates" component={TemplatesPage}/>
                        <Route exact path="/public/items/:itemId" component={PublicPage}/>
                        <Route path="/">
                            <HashRouter>
                                <Route path="/" component={App}/>
                            </HashRouter>
                        </Route>
                    </Switch>
                </BrowserRouter>
            </Provider>,
            document.getElementById('root')
        );
    } else {
        ReactDOM.render(
            <Provider store={store}>
                <Loading/>
            </Provider>,
            document.getElementById('root')
        );
    }
}

document.onreadystatechange = listen;

unregister();
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA

// **** DEPRECIATED ****

// if (Notification.permission === 'granted') {
//   serviceWorker.register();
// } else if (Notification.permission !== 'denied') {
//   Notification.requestPermission().then((permission) => {
//     if (permission === 'granted') {
//       serviceWorker.register();
//     }
//   });
// }
