import { Plus, Trash2 } from "lucide-react";
import { Column, Id, Task } from "../types"
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import Taskcard from "./Taskcard";

interface Props {
    column: Column;
    deleteColumn: (id: Id) => void;
    updateColumn: (id: Id, title: string) => void;

    createTask: (columnId: Id) => void;
    updateTask: (id: Id, content: string) => void;
    tasks: Task[];
    deleteTask: (id: Id) => void;
}
const ColumnContainer = (props: Props) => {
    const { column, deleteColumn, updateColumn, createTask, tasks,deleteTask,updateTask } = props;

    const [editMode, setEditMode] = useState(false);

    const taskIds = useMemo(()=>{
        return tasks.map(task => task.id)
    },[tasks])

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
        disabled: editMode

    });

    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
    }
    if (isDragging) {
        return <div ref={setNodeRef}
            className="
            bg-gray-900
            w-[350px]
            h-[500px]
            min-h-[500px]
            rounded-md
            flex 
            flex-col
            border-2
            opacity-30
            border-dashed
            border-gray-500
            "
        ></div>
    }




    return (
        <div
            className="
            bg-gray-900
            w-[350px]
            h-[500px]
            min-h-[500px]
            rounded-md
            flex 
            flex-col
            "
            ref={setNodeRef}
            style={style}

        >
            <div
                className="
                    bg-mainBackgroundColor
                    text-md
                    h-[60px]
                    cursor-grab
                    rounded-md
                    rounded-b-none
                    p-3
                    font-bold
                    border-columnBackgroundColor
                    border-4
                    flex
                    items-center
                    justify-between "
                {...attributes}
                {...listeners}

                onClick={() => setEditMode(true)}
            >
                <div className="flex gap-2">
                    <div
                        className="
                            flex
                            justify-center
                            items-center
                            bg-columnBackgroundColor
                            px-2
                            py-1
                            text-sm
                            rounded-full">
                        0
                    </div>
                    {!editMode && column.title}
                    {editMode &&
                        <input
                            className="bg-black focus:border-gray-200 outline-none px-2"
                            value={column.title}
                            onChange={e => updateColumn(column.id, e.target.value)}

                            autoFocus
                            onBlur={
                                () => setEditMode(false)
                            }
                            onKeyDown={e => {
                                if (e.key !== "Enter") return;
                                setEditMode(false)

                            }}
                        />}
                </div>
                <button className="stroke-gray-500 hover:stroke-white hover:bg-columnBackgroundColor rounded
                    px-1
                    py-2"
                    onClick={() => { deleteColumn(column.id) }}
                >
                    <Trash2 className="text-gray-600" />
                </button>
            </div>
            {/* Column Task Container */}

            <div
                className="flex flex-grow flex-col gap-4 p-2 overflow-x-hidden overflow-y-auto">
                    <SortableContext items={taskIds}>
                        {tasks.map((task) => (

                            <Taskcard
                            key={task.id}
                            task={task}
                            deleteTask={deleteTask} 
                            updateTask={updateTask}
                            />
                        ))}
                </SortableContext>
            </div>

            {/* Column Footer */}
            <button className="flex gap-2 items-center justify-center border-columnBackgroundColor border-x-columnBackgroundColor hover:bg-mainBackgroundColor hover:text-rose-500 active:bg-black py-4"
                onClick={() => createTask(column.id)}
            >
                <Plus className="text-gray-500" /> Add Task
            </button>
        </div>
    )
}

export default ColumnContainer