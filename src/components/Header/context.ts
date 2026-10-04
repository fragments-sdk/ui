"use client";

import * as React from "react";

/**
 * True inside a slot that is already the page's banner landmark (AppShell.Header).
 * A Header placed there renders a div, so the page keeps one banner.
 */
export const HeaderLandmarkContext = React.createContext(false);
