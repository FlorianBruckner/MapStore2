/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const src = require("./attribution/logo-acg.png");
require('./footer/footer.css');

class Footer extends React.Component {
    render() {
        return (
            <div className="ms-footer col-md-12">
            <div><a target="_blank" href="http://www.austrocontrol.at/"> <img src={src} width="140" title="Austro Control" alt="Austro Control" /></a> <br/><br/></div>
            </div>
        );
    }
}

module.exports = {
    FooterPlugin: Footer
};
