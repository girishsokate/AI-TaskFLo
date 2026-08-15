import React, { useState } from "react";
import { Search, ListFilter, ArrowUpDown, Plus } from "lucide-react";
const TaskSearchbar = ({
  search,
  setSearch,
  categories,
  categoryFilter,
  setCategoryFilter,
  setSortAsc,
  openCreate,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  return (
    <div className="taskboard__toolbar">
      <div className="input-field taskboard__search">
        <span className="input-field__icon">
          <Search size={16} strokeWidth={1.75} />
        </span>
        <input
          type="search"
          className="input-field__control"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search tasks"
        />
      </div>

      <div className="taskboard__actions">
        <div className="taskboard__filter-wrap">
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={() => setFilterOpen((o) => !o)}
            aria-expanded={filterOpen}
          >
            <ListFilter size={16} />
            Filter
          </button>
          {filterOpen && (
            <div className="taskboard__filter-menu" role="menu">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  role="menuitem"
                  className={`taskboard__filter-item${
                    categoryFilter === cat ? " is-active" : ""
                  }`}
                  onClick={() => {
                    setCategoryFilter(cat);
                    setFilterOpen(false);
                  }}
                >
                  {cat === "all" ? "All categories" : cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setSortAsc()}
        >
          <ArrowUpDown size={16} />
          Sort
        </button>

        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => openCreate("todo")}
        >
          <Plus size={16} />
          Create Task
        </button>
      </div>
    </div>
  );
};

export default TaskSearchbar;
