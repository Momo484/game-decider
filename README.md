# Game Decider

**Democracy for Game Night.** Stop wasting the session on "What should we play?" debates. This is a simple website aimed at simulating a preferential voting system, under the central theme of game nights.

---

## The Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL + Real-time) |
| **Hosting** | [Vercel](https://vercel.com/) |
| **Drag & Drop** | [@dnd-kit](https://dnd-kit.com/) |

---

## Features

* **Real-Time Lobbies:** Create or join lobbies instantly using unique invite codes similar to kahoot.
* **Preferential Voting:** Rank games from best to worst using a drag-and-drop interface.
* **Dynamic Participant Tracking:** See who's in the lobby before the voting begins.
* **Automated Results:** The host reveals the winner based on the group's collective rankings.

---

## Known issues
* Username resitrictions are not properly implemented as of yet. Causing some unintended visual behaviour.
* People joining with the same username causes issues.
* Multiple entries of the same game will cause issues with the drag and drop interface.
