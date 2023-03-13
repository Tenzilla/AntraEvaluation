//console.log("hello world")

/* 
  client side
    template: static template
    logic(js): MVC(model, view, controller): used to server side technology, single page application
        model: prepare/manage data,
        view: manage view(DOM),
        controller: business logic, event bindind/handling

  server side
    json-server
    CRUD: create(post), read(get), update(put, patch), delete(delete)


*/

//read
/* fetch("http://localhost:3000/todos")
    .then((res) => res.json())
    .then((data) => {
        console.log(data);
    }); */

const APIs = (() => {
    const createTodo = (newTodo) => {
        return fetch("http://localhost:3000/todos", {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const deleteTodo = (id) => {
        return fetch("http://localhost:3000/todos/" + id, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return fetch("http://localhost:3000/todos").then((res) => res.json());
    };
    return { createTodo, deleteTodo, getTodos };
})();

//IIFE
//todos
/* 
    hashMap: faster to search
    array: easier to iterate, has order
 
 
*/
const Model = (() => {
    class State {
        #todos; //private field
        #onChange; //function, will be called when setter function todos is called
        constructor() {
            this.#todos = [];
        }
        get todos() {
            return this.#todos;
        }
        set todos(newTodos) {
            // reassign value
            console.log("setter function");
            this.#todos = newTodos;
            this.#onChange?.(); // rendering
        }

        subscribe(callback) {
            //subscribe to the change of the state todos
            this.#onChange = callback;
        }
    }
    const { getTodos, createTodo, deleteTodo } = APIs;
    return {
        State,
        getTodos,
        createTodo,
        deleteTodo,
    };
})();
/* 
    todos = [
        {
            id:1,
            content:"eat lunch"
        },
        {
            id:2,
            content:"eat breakfast"
        }
    ]
 
*/
const View = (() => {
    const todolistEl = document.querySelector(".pending-task");
    const submitBtnEl = document.querySelector(".submit-btn");
    const inputEl = document.querySelector(".input");

    const editIcon = `<svg fill="#fff" width="auto" height="auto" focusable="false" aria-hidden="true" viewBox="0 0 24 24"  aria-label="fontSize small">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" style="fill: currentColor;"></path>
      </svg>`;

    const deleteIcon = `<svg fill="#fff" focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small" width="auto" height="auto"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" ></path></svg>`;
    const arrowLeft = `<svg fill="#fff" focusable="false" aria-hidden="true" viewBox="0 0 24 24" aria-label="fontSize small" width="auto" height="auto"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" style="fill: currentColor;"></path></svg>`;
    const arrowRight = `<svg fill="#fff" focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="ArrowForwardIcon" aria-label="fontSize small" width="auto" height="auto"><path d="m12 4-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path></svg>`;

    const renderTodos = (todos) => {
        let todosTemplate = "";
        todos.forEach((todo) => {
            const liTemplate = `
                      <div style="padding: 0.1rem; margin: 0;  display: flex; width: 100%; text-align: center; ">
                          <div class="change"  style="background-color: #e6e2d3; display: flex; width: 100%; padding: 0.2rem;">
                              <div class="hide" style="flex: 1; text-align: center;">
                              <button class="left-btn" style="cursor: pointer; border: none; background-color: #4caf50; color: #fff; margin: 0.1em;" id="${todo.id}">
                              ${arrowLeft}
                              </button>
                              </div>
                              <div style="flex: 7; text-align: center;">
                             
                                <span contentEditable=${todo.editable}>${todo.content}</span>
                               </div>
                              <div style="flex: 3; display: flex; justify-content: space-between">
                               <button class="edit-btn" style="cursor: pointer; border: none; background-color: #008cba; color: #fff; margin: 0.1em;" id="${todo.id}">
                                  ${editIcon}
                               </button>
                               <button class="delete-btn" style="cursor: pointer; border: none; background-color: #c94c4c; color: #fff; margin: 0.1em; " id="${todo.id}">
                                  ${deleteIcon}
                               </button>
                              <button class="right-btn" style="cursor: pointer; border: none; background-color: #4caf50; color: #fff; margin: 0.1em; " id="${todo.id}">
                                  ${arrowRight}
                              </button>
                           </div>
                            </div>
                      </div>`;

            todosTemplate += liTemplate;
        });
        if (todos.length === 0) {
            todosTemplate = "<h4>no task to display!</h4>";
        }

        todolistEl.innerHTML = todosTemplate;
    };

    const clearInput = () => {
        inputEl.value = "";
    };

    return { renderTodos, submitBtnEl, inputEl, clearInput, todolistEl };
})();

const Controller = ((view, model) => {
    const state = new model.State();
    const init = () => {
        model.getTodos().then((todos) => {
            todos.reverse();
            state.todos = todos;
        });
    };

    const handleSubmit = () => {
        view.submitBtnEl.addEventListener("click", (event) => {
            /* 
                      1. read the value from input
                      2. post request
                      3. update view
                  */
            const inputValue = view.inputEl.value;
            // console.log(inputValue, event.target);
            if (inputValue) {
                model.createTodo({ content: inputValue }).then((data) => {
                    state.todos = [data, ...state.todos];
                    view.clearInput();
                });
            }
        });
    };

    const handleEdit = () => {
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className == "edit-btn") {
                const value = event.target.value;
                console.log("value", typeof value);

                const editButton = document.querySelector(".edit-btn");
                const myClass = event.target.parentNode.parentNode.parentNode;

                editButton.addEventListener("click", () => {
                    myClass.contentEditable = true;
                    myClass.focus();
                });

                myClass.addEventListener("blur", () => {
                    myClass.contentEditable = false;
                });
            }
        });
    };

    const handleRight = () => {
        view.todolistEl.addEventListener("click", (event) => {
            console.log("id", event.target);
            if (event.target.className == "right-btn") {
                const box = event.target.parentNode.parentNode.parentNode;
                const com = document.querySelector("#completed-list");
                const leftBtn = event.target.parentNode.parentNode;
                const btns = event.target.parentNode;
                com.appendChild(box);

                leftBtn.firstElementChild.classList.toggle('hide');
                console.log(btns);
                event.target.classList.toggle('hide');
                btns.classList.toggle('change')

            }
        });
    };

    const handleLeft = () => {
        const compListEl = document.querySelector(".shif");
        console.log("movie da sce", compListEl);
        compListEl.addEventListener("click", (event) => {
            if (event.target.className == "left-btn") {
                const box = event.target.parentNode.parentNode.parentNode;
                console.log(box);
                const com = document.querySelector(".pending-task");
                const rightBtn = event.target.parentNode.parentNode.lastElementChild.lastElementChild;
                const btns = event.target.parentNode.parentNode.lastElementChild;
                com.appendChild(box);


                console.log(btns, rightBtn);
                rightBtn.classList.toggle('hide');
                event.target.classList.toggle('hide');
                btns.classList.toggle('change');



            }
        });


    };

    const handleDelete = () => {
        //event bubbling
        /* 
                1. get id
                2. make delete request
                3. update view, remove
            */
        view.todolistEl.addEventListener("click", (event) => {
            if (event.target.className === "delete-btn") {
                const id = event.target.id;
                console.log("id", typeof id, event.target);
                model.deleteTodo(+id).then((data) => {
                    state.todos = state.todos.filter((todo) => todo.id !== +id);
                });
            }
        });
    };

    const bootstrap = () => {
        init();
        handleSubmit();
        handleDelete();
        handleEdit();
        handleRight();
        handleLeft();

        state.subscribe(() => {
            view.renderTodos(state.todos);
        });
    };
    return {
        bootstrap,
    };
})(View, Model); //ViewModel

Controller.bootstrap();
