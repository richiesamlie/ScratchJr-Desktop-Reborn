// @vitest-environment jsdom
import "./renderer-harness.js";
import { describe, it, expect, beforeEach, vi } from "vitest";
import Home from "../../src/app/src/lobby/Home";
import { gn } from "../../src/app/src/utils/lib";
import { stubMedia } from "./helpers/editor-fixtures.js";

describe("Lobby 1-Click .sjr Import Card", () => {
    let scrollarea;

    beforeEach(() => {
        stubMedia();
        document.body.innerHTML = "<div id=\"htmlcontents\"><div class=\"inner\"><div id=\"scrollarea\" class=\"scrollarea\"></div></div></div>";
        scrollarea = gn("scrollarea");
    });

    it("creates open project card with proper structure", () => {
        Home.openProjectThumbnail(scrollarea);
        const card = scrollarea.querySelector("#openproject");
        expect(card).not.toBeNull();
        expect(card.querySelector(".aproject.open")).not.toBeNull();
        expect(card.querySelector(".projecttitle h4")).not.toBeNull();
    });

    it("getNextName ignores both newproject and openproject cards", () => {
        Home.emptyProjectThumbnail(scrollarea);
        Home.openProjectThumbnail(scrollarea);

        // Even though newproject and openproject are in scrollarea, name should still be Project 1
        expect(Home.getNextName("Project")).toBe("Project 1");

        // Add an actual project "Project 1"
        const p1 = document.createElement("div");
        p1.className = "projectthumb";
        p1.id = "1";
        p1.innerHTML = "<div class=\"aproject\"></div><div class=\"projecttitle\"><h4>Project 1</h4></div>";
        scrollarea.appendChild(p1);

        expect(Home.getNextName("Project")).toBe("Project 2");
    });

    it("displayProjects renders both empty (new) and open thumbnail cards", () => {
        Home.displayProjects(JSON.stringify([]));
        const newProj = scrollarea.querySelector("#newproject");
        const openProj = scrollarea.querySelector("#openproject");
        expect(newProj).not.toBeNull();
        expect(openProj).not.toBeNull();
    });

    it("openFileDialog creates file input targeting .sjr and clicks it", () => {
        const clickSpy = vi.spyOn(HTMLInputElement.prototype, "click");
        Home.openFileDialog();
        const input = document.getElementById("open-project-file-input");
        expect(input).not.toBeNull();
        expect(input.type).toBe("file");
        expect(input.accept).toBe(".sjr");
        expect(clickSpy).toHaveBeenCalled();
        clickSpy.mockRestore();
    });
});
