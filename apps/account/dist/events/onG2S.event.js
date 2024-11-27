import config from "@peekaboo-ssr/config/lobby";
import BaseEvent from "@peekaboo-ssr/events/BaseEvent";
import { getHandlerByPacketType } from "../handlers/index.js";
import { parsePacketG2S } from "@peekaboo-ssr/utils";
class G2SEventHandler extends BaseEvent {
  onConnection(socket) {
    console.log(
      `Gate connected from: ${socket.remoteAddress}:${socket.remotePort}`
    );
    socket.buffer = Buffer.alloc(0);
  }
  async onData(socket, data) {
    console.log("Service\uAC00 \uAC8C\uC774\uD2B8\uB85C\uBD80\uD130 \uB370\uC774\uD130\uB97C \uBC1B\uC74C..", data);
    socket.buffer = Buffer.concat([socket.buffer, data]);
    while (socket.buffer.length >= config.header.client.typeLength + config.header.client.clientKeyLength) {
      let offset = 0;
      const packetType = socket.buffer.readUint16BE(offset);
      offset += config.header.client.typeLength;
      console.log(packetType);
      const clientKeyLength = socket.buffer.readUInt8(offset);
      offset += config.header.client.clientKeyLength;
      console.log(clientKeyLength);
      const clientKey = socket.buffer.subarray(offset, offset + clientKeyLength).toString();
      console.log(clientKey);
      offset += clientKeyLength;
      const totalHeaderLength = config.header.client.typeLength + config.header.client.clientKeyLength + clientKeyLength;
      if (socket.buffer.length < totalHeaderLength) {
        break;
      }
      const payloadLength = socket.buffer.readUint32BE(offset);
      offset += config.header.client.payloadLength;
      console.log(payloadLength);
      const totalPacketLength = totalHeaderLength + payloadLength;
      if (socket.buffer.length < totalPacketLength) {
        break;
      }
      const payloadBuffer = socket.buffer.subarray(
        offset,
        offset + payloadLength
      );
      offset += payloadLength;
      try {
        console.error("!!!!!", payloadBuffer);
        const payload = parsePacketG2S(payloadBuffer);
        socket.buffer = socket.buffer.subarray(offset);
        const handler = getHandlerByPacketType(packetType);
        await handler(socket, clientKey, payload);
      } catch (e) {
        console.error(e);
      }
    }
  }
  onEnd(socket) {
    console.log("onClose", socket.remoteAddress, socket.remotePort);
  }
  onError(socket, err) {
    console.log("onClose", socket.remoteAddress, socket.remotePort);
  }
}
var onG2S_event_default = G2SEventHandler;
export {
  onG2S_event_default as default
};
//# sourceMappingURL=onG2S.event.js.map
