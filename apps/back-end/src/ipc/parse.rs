use anyhow::Result;
use serde_json::{Map, Value};

use crate::{
	Error,
	ipc::{Channel, HSBK, Request, RequestPayload},
};

pub fn parse(input: &str) -> Result<Request> {
	let req: Value = serde_json::from_str(input)?;
	let channel = match &req["channel"] {
		Value::String(ch) if ch == "Discovery" => Ok(Channel::Discovery),
		Value::String(ch) if ch == "GetColor"  => Ok(Channel::GetColor),
		Value::String(ch) if ch == "SetColor"  => Ok(Channel::SetColor),
		other => Err(Error(format!("Expected channel but received {:?}", other))),
	}?;
	let payload = match &req["payload"] {
		Value::Null => Ok(None),
		Value::Object(payload) => match &channel {
			Channel::GetColor => parse_get_color_payload(payload),
			Channel::SetColor => parse_set_color_payload(payload),
			other => Err(Error(format!("Expected payload, received {:?}", other)).into()),
		},
		other => Err(Error(format!("Expected payload, received {:?}", other)).into()),
	}?;

	Ok(Request { channel, payload })
}

fn parse_get_color_payload(payload: &Map<String, Value>) -> Result<Option<RequestPayload>> {
	let id = parse_id(payload.get("id"))?;
	Ok(Some(RequestPayload::GetColor { id }))
}

fn parse_set_color_payload(payload: &Map<String, Value>) -> Result<Option<RequestPayload>> {
	let id = parse_id(payload.get("id"))?;
	let color = parse_color(payload.get("color"))?;
	Ok(Some(RequestPayload::SetColor { id, color }))
}

fn parse_id(id: Option<&Value>) -> Result<u64> {
	match id {
		Some(Value::String(id)) => {
			u64::from_str_radix(&id[2..], 16)
				.map_err(|err| err.into())
		},
		other => Err(Error(format!("Expected id, received {:?}", other)).into()),
	}
}

fn parse_color(color: Option<&Value>) -> Result<HSBK> {
	let color = match color {
		Some(Value::Object(c)) => Ok(c),
		other => Err(Error(format!("Expected color object, received {:?}", other))),
	}?;

	let hue = coerce_u16(color.get("hue"))?;
	let saturation = coerce_u16(color.get("saturation"))?;
	let brightness = coerce_u16(color.get("brightness"))?;
	let kelvin = coerce_u16(color.get("kelvin"))?;

	Ok(HSBK { hue, saturation, brightness, kelvin })
}

fn coerce_u16(value: Option<&Value>) -> Result<u16> {
	match value {
		Some(Value::Number(v)) => Ok(v.as_u64().unwrap() as u16),
		Some(Value::Null) | None => Ok(0),
		other => Err(Error(format!(
			"Expected u16, null, or undefined, received {:?}",
			other
		)).into()),
	}
}
