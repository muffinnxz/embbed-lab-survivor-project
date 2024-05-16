import admin from "@/lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    sensorId: string;
    value: number;
  };
}

const handler = async (req: ExtendedNextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const fs = admin.firestore();

    if (!req.body.sensorId || !req.body.value) {
      res.status(400).json({ error: "Bad Request" });
      return;
    }

    try {
      const ref = await fs.collection("data").add({
        sensorId: req.body.sensorId,
        value: req.body.value,
        timestamp: new Date().toISOString()
      });

      const data = await ref.get();

      res.status(200).json({ message: "success", data: data });
    } catch (error) {
      console.error("Error adding document: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else if (req.method === "GET") {
    const fs = admin.firestore();

    try {
      const snapshot = await fs.collection("data").get();
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      res.status(200).json({ message: "success", data: data });
    } catch (error) {
      console.error("Error getting documents: ", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
};

export default handler;
