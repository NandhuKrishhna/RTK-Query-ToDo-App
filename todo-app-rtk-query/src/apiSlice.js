import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const api = createApi({
    baseQuery: fetchBaseQuery({baseUrl: "http://localhost:3000"}),
    tagTypes: ["Tasks"],
    endpoints : (builder)=> ({
        getTasks : builder.query({
            query : () => "/tasks",
            transformResponse : (res) => res.sort((a,b) => b.id - a.id),
            providesTags: ["Tasks"],
        }),
        addTask : builder.mutation({
            query :(task) => ({
                url : "/tasks",
                method : "POST",
                body : task
            }),
            invalidatesTags:["Tasks"],
           async onQueryStarted(task, {dispatch, queryFulfilled}){
            const patchResult = dispatch(
                api.util.updateQueryData("getTasks", undefined , (draft)=>{
                    draft.unshift(task)
                })
            );
            try {
                await queryFulfilled;
            } catch (error) {
                patchResult.undo()
            }
            
           },
        }),
        updateTask : builder.mutation({
            query:({id, ...updatedTask})=>({
                url:`/tasks/${id}`,
                method : "PATCH",
                body: updatedTask
            }),
            invalidatesTags:["Tasks"],
            async onQueryStarted({id, ...updatedTask}, {dispatch, queryFulfilled}){
                const patchResult = dispatch(
                    api.util.updateQueryData("getTasks", undefined , (taskList)=>{
                        const taskIndex = taskList.findIndex((el)=> el.id === id)
                        taskList[taskIndex] = {...taskList[taskIndex], ...updatedTask}
                    })
                );
                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo()
                }
                
               }
        }),
        deleteTask : builder.mutation({
            query:(id)=>({
                url:`/tasks/${id}`,
                method : "DELETE",
            }),
            invalidatesTags:["Tasks"],
            async onQueryStarted(id, {dispatch, queryFulfilled}){
                const patchResult = dispatch(
                    api.util.updateQueryData("getTasks", undefined , (taskList)=>{
                        const taskIndex = taskList.findIndex((el)=> el.id === id)
                        taskList.splice(taskIndex,1)
                    })
                );
                try {
                    await queryFulfilled;
                } catch (error) {
                    patchResult.undo()
                }
                
               }
        })
    
    })
});

export const {
    useGetTasksQuery, 
    useAddTaskMutation , 
    useUpdateTaskMutation,
    useDeleteTaskMutation
} = api