"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";
import HomeScreen from "@/components/HomeScreen";
import ItemsScreen from "@/components/ItemsScreen";
import PersonsScreen from "@/components/PersonsScreen";
import AttributionScreen from "@/components/AttributionScreen";
import FeesScreen from "@/components/FeesScreen";
import ResultScreen from "@/components/ResultScreen";

export default function Page() {
  const { step, darkMode } = useStore();

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  return (
    <>
      {step === "home" && <HomeScreen />}
      {step === "items" && <ItemsScreen />}
      {step === "persons" && <PersonsScreen />}
      {step === "attribution" && <AttributionScreen />}
      {step === "fees" && <FeesScreen />}
      {step === "result" && <ResultScreen />}
    </>
  );
}
