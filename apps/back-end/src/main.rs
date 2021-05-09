use std::{
	fmt::{self, Display},
	io::{self, Write},
	time::{Duration, Instant}
};
use anyhow::Result;
use serde_json::Value;
use lifx::udp::Manager;

use crate::ipc::{Bulb, Payload};

mod ipc;

#[allow(unreachable_code)]
fn main() -> Result<()> {
	let stdin = io::stdin();
	let mut stdout = io::stdout();
	let mut mgr = Manager::new()?;

	loop {
		if Instant::now() - mgr.last_discovery > Duration::from_secs(300) {
			mgr.discover()?;
		}
		mgr.refresh();

		let mut input = String::new();
		match stdin.read_line(&mut input) {
			Ok(_) => {
				dispatch(&input, &mut stdout, &mut mgr)?;
			}
			Err(err) => {
				eprintln!("{}", err);
			}
		}
	}

	Ok(())
}

fn dispatch(
	raw_msg: &str,
	stdout: &mut io::Stdout,
	mgr: &mut Manager,
) -> Result<()> {
	match parse(raw_msg) {
		Ok(msg) => {
			let res_msg = match msg.channel {
				ipc::Channel::Discovery => discovery(mgr)?,
			};
			let response = serde_json::to_string(&res_msg)?;

			writeln!(stdout, "{}", response).expect("Failed to write to stdout!");
		}
		Err(err) => {
			eprintln!("{}", err)
		}
	}
	stdout.flush()?;

	Ok(())
}

fn parse(message: &str) -> Result<ipc::Message> {
	let parsed: Value = serde_json::from_str(message)?;

	let channel = match &parsed["channel"] {
		Value::String(ch) if ch == "Discovery" => Ok(ipc::Channel::Discovery),
		other => Err(Error(format!("Expected channel but received {:?}", other))),
	}?;

	let payload: Option<Payload> = match &parsed["payload"] {
		Value::Null => Ok(None),
		other => Err(Error(format!("Expected payload, received {:?}", other))),
	}?;

	Ok(ipc::Message { channel, payload })
}

fn discovery(mgr: &mut Manager) -> Result<ipc::Message> {
	let bulbs: Vec<Bulb> = if let Ok(bulbs) = mgr.bulbs.lock() {
		bulbs.iter()
			.map(|(_, bulb)| bulb.into())
			.collect()
	} else {
		vec![]
	};

	Ok(ipc::Message {
		channel: ipc::Channel::Discovery,
		payload: Some(Payload::Discovery(bulbs)),
	})
}

#[derive(thiserror::Error, Debug)]
struct Error(String);

impl Display for Error {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		write!(f, "{}", self.0)
	}
}
