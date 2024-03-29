"use client"

import { contractABI } from "@/blockchain/abi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRef } from "react";
import { useAccount, usePublicClient, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { waitForTransactionReceipt } from '@wagmi/core'


const contractAddress = "0x132aD93aF0b4A0A34147b9857EeE014B424F62e2" as const;

type Todo = {
  id: bigint,
  task: string,
  isCompleted: boolean
  timestamp: bigint
}

export default function Home() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { address } = useAccount();
  const publicClient = usePublicClient
  const { data, refetch } = useReadContract({
    abi: contractABI,
    address: contractAddress,
    functionName: "getTodos",
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  })

  const userTodosCount = useReadContract({
    abi: contractABI,
    address: contractAddress,
    functionName: "userTodoCount",
    args: [address as `0x${string}`],
    query: { enabled: !!address }
  })


  const { writeContract } = useWriteContract({
    mutation: {
      onSuccess: async (data) => {
        console.log('data: ', data)
        await publicClient?.waitForTransactionReceipt({ hash: data });
        await refetch();
      }
    }
  });



  const createTodo = () => {
    if (!inputRef.current && !inputRef.current!.value) return console.error("No input value");
    writeContract({
      abi: contractABI,
      address: contractAddress,
      functionName: 'createTodo',
      args: [inputRef.current!.value],

    })
  }

  const deleteTodo = (id: bigint) => {
    writeContract({
      abi: contractABI,
      address: contractAddress,
      functionName: 'deleteTodo',
      args: [id],
    })
  }

  const toggleTodo = (id: bigint) => {
    writeContract({
      abi: contractABI,
      address: contractAddress,
      functionName: "toggleTodo",
      args: [id],
    })
  }

  const year = new Date().getFullYear();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 bg-black">
      <div className="flex ml-auto md:h-50 justify-end items-center gap-[30px] font-bold text-[15px] h-10 mt-0" >
        <ConnectButton showBalance={false} />
      </div>

      <div className="flex gap-5">
        <Input placeholder="Add Todo item" ref={inputRef} />
        <Button className="cursor-pointer active:scale-95" onClick={() => createTodo()}>Create Task</Button>
      </div>

      <ul className="flex flex-col w-full max-w-[50rem]">
        {data?.map((el: Todo) => (
          <li key={el.id} className="flex gap-5 items-center border border-black rounded-lg p-2">
            <p className="border rounded-lg px-2 text-white">{el.isCompleted ? "Done" : "Pending"}</p>
            <p className="flex-1 text-white">{el.task}</p>
            <Button className="cursor-pointer active:scale-95 text-white" onClick={() => deleteTodo(el.id)}>Delete</Button>
            <Button className="cursor-pointer active:scale-95 text-white" onClick={() => toggleTodo(el.id)}>Toggle</Button>
          </li>
        ))}
      </ul>
      <div>
        <p className="text-white">A Lagos Labs Joint {year}</p>
      </div>
    </main>
  );
}
