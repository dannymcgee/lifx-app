use std::{
	io::{self, Write},
	thread,
	time::{Duration, Instant},
};
use anyhow::Result;
use lifx::udp::Manager;

use crate::ipc::{Bulb, Channel, RequestPayload, Response, ResponsePayload};

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
			Ok(_) => dispatch(&input, &mut stdout, &mut mgr)?,
			Err(err) => eprintln!("{}", err),
		}
	}

	Ok(())
}

fn dispatch(input: &str, stdout: &mut io::Stdout, mgr: &mut Manager) -> Result<()> {
	let req = ipc::parse(input);
	let res = match req.channel {
		Channel::Discovery => discovery(mgr),
		Channel::GetColor  => get_color(mgr, &req.payload.unwrap()),
		Channel::SetColor  => set_color(mgr, &req.payload.unwrap()),
	};
	let res_str = serde_json::to_string(&res)?;

	write!(stdout, "{}", res_str)?;
	stdout.flush()?;

	Ok(())
}

fn discovery(mgr: &mut Manager) -> Response {
	let bulbs: Vec<Bulb> = if let Ok(bulbs) = mgr.bulbs.lock() {
		bulbs.iter()
			.map(|(_, bulb)| bulb.into())
			.collect()
	} else {
		vec![]
	};

	Response {
		channel: Channel::Discovery,
		payload: ResponsePayload::Discovery(bulbs),
	}
}

fn get_color(_mgr: &mut Manager, _msg: &RequestPayload) -> Response {
	unimplemented!()
}

fn set_color(mgr: &mut Manager, msg: &RequestPayload) -> Response {
	let bulbs = mgr.bulbs.lock().expect("Failed to lock bulbs for writing");
	let (targets, duration) = if let RequestPayload::SetColor { values, duration } = msg {
		(values, duration)
	} else {
		unreachable!()
	};

	for (id, color) in targets.iter() {
		bulbs[id].set_color((*color).into(), *duration).unwrap();
	}

	thread::sleep(*duration);

	let ids: Vec<String> = targets.iter()
		.map(|(id, _)| format!("{:#018x}", id))
		.collect();

	Response {
		channel: Channel::SetColor,
		payload: ResponsePayload::SetColor(ids),
	}
}
