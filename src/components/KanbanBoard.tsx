import { CirclePlus } from "lucide-react"
import { useMemo, useState } from "react";

import ColumnContainer from "./ColumnContainer";
import { Column, Id, Task } from "../types";
import { DndContext, DragEndEvent, DragOverEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import Taskcard from "./Taskcard";

const KanbanBoard = () => {
    const [columns, setColumns] = useState<Column[]>([]);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = [useSensor(PointerSensor, {
        activationConstraint: {
            distance: 3, // distance 3px
        },
    })];

    console.log(columns);

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    function createColumn() {
        const columnToAdd: Column = {
            id: genarateId(),
            title: `Column ${columns.length + 1}`,
        };
        setColumns([...columns, columnToAdd]);
    }

    function deleteColumn(id: Id) {
        const filteredColumn = columns.filter((col) => col.id !== id);
        setColumns(filteredColumn);

    const newTasks = tasks.filter((t) => t.columnId !== id);
    setTasks(newTasks);
    }

    function updateColumn(id: Id, title: string) {
        const newColumns = columns.map((col) => {
            if (col.id !== id) return col;

            return { ...col, title };
        });
        setColumns(newColumns);
    }


    function createTask(columnId: Id) {
        const newTask: Task = {
            id: genarateId(),
            columnId,
            content: `Task ${tasks.length + 1}`,
        };
        setTasks([...tasks, newTask]);
    }

    function deleteTask(id: Id) {
        const newTask = tasks.filter((task) => task.id !== id);
        setTasks(newTask);
    }

    function updateTask(id: Id, content: string) {
        const newTasks = tasks.map((task) => {
            if (task.id !== id) return task;
            return { ...task, content };
        });
        setTasks(newTasks);
    }

    function ondragstart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function ondragend(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);
        const { active, over } = event;

        if (!over) {
            return;
        }
        const activeColumnId = active.id;
        const overColumnId = over.id;
        if (activeColumnId === overColumnId) return;
        setColumns(columns => {
            const activeColumnIndex = columns.findIndex((col) => col.id === activeColumnId);
            const overColumnIndex = columns.findIndex((col) => col.id === overColumnId);
            return arrayMove(columns, activeColumnIndex, overColumnIndex);
        });
    }
    
    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;

        if (!over) {
            return;
        }
        const activeColumnId = active.id;
        const overColumnId = over.id;
        if (activeColumnId === overColumnId) return;


        const isActiveATask = active.data.current?.type==="Task"
        const isOverATask = over.data.current?.type === "Task";

        if(!isActiveATask ) return;

        if(isActiveATask && isOverATask){
            setTasks((tasks) =>{
                const activeIndex = tasks.findIndex(t=> t.id === activeColumnId)
                const overIndex = tasks.findIndex(t=> t.id === overColumnId)

                tasks[activeIndex].columnId = tasks[overIndex].columnId;
                return arrayMove(tasks, activeIndex, overIndex);
            })
        }

        const isOverAColumn = over.data.current?.type === "Column";

        if(isActiveATask && isOverAColumn){
            setTasks((tasks) =>{
                const activeIndex = tasks.findIndex(t=> t.id === activeColumnId)

                tasks[activeIndex].columnId = overColumnId;
                return arrayMove(tasks, activeIndex, activeIndex);
            })
        }
    }

    return (
        <div className="m-auto flex min-h-screen w-full items-center  overflow-x-auto overflow-y-hidden px-[40px]">
            <DndContext 
            sensors={sensors}
            onDragStart={ondragstart} 
            onDragEnd={ondragend}
            onDragOver={onDragOver}>
                <div className="m-auto flex gap-4">
                    <div className="flex gap-4">
                        <SortableContext items={columnsId}>
                            {columns.map((col) => (
                                <ColumnContainer
                                    key={col.id}
                                    column={col}
                                    deleteColumn={deleteColumn}
                                    updateColumn={updateColumn}

                                    createTask={createTask}
                                    deleteTask={deleteTask}
                                    updateTask={updateTask}
                                    tasks={tasks.filter((task) => task.columnId === col.id)}
                                />
                            ))}
                        </SortableContext>
                    </div>

                    <button
                        className="h-[68px] w-[350px] cursor-pointer rounded-lg bg-black border-2 border-gray-700 p-4 ring-rose-500 hover:ring-2 flex gap-2 justify-center items-center"

                        onClick={() => createColumn()}
                    >
                        <CirclePlus className="text-white" /> Add Column
                    </button>
                </div>
                {createPortal(
                    <DragOverlay>
                        {activeColumn && (
                            <ColumnContainer
                                column={activeColumn}
                                deleteColumn={deleteColumn}
                                updateColumn={updateColumn}
                                createTask={createTask}
                                deleteTask={deleteTask}
                                updateTask={updateTask}
                                tasks={tasks.filter((task) => task.columnId === activeColumn.id)}
                            />
                        )}
                        {activeTask && <Taskcard task={activeTask}
                            deleteTask={deleteTask}
                            updateTask={updateTask} />}
                    </DragOverlay>,
                    document.body
                )}
            </DndContext>
        </div>
    )




}

function genarateId() {
    return Math.floor(Math.random() * 10001);
}




export default KanbanBoard